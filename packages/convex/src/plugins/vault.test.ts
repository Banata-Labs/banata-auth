import { describe, expect, it } from "vitest";
import {
	base64ToUint8,
	decryptValue,
	deriveKey,
	encryptValue,
	uint8ToBase64,
	vaultPlugin,
} from "./vault";

describe("Vault plugin", () => {
	// ─── Plugin Factory ─────────────────────────────────────────────────

	describe("vaultPlugin()", () => {
		const plugin = vaultPlugin();

		it("returns a plugin with the correct id", () => {
			expect(plugin.id).toBe("banata-vault");
		});

		it("registers all five endpoints", () => {
			expect(plugin.endpoints).toBeDefined();
			const endpoints = plugin.endpoints!;
			expect(endpoints.vaultEncrypt).toBeDefined();
			expect(endpoints.vaultDecrypt).toBeDefined();
			expect(endpoints.vaultList).toBeDefined();
			expect(endpoints.vaultDelete).toBeDefined();
			expect(endpoints.vaultRotateKey).toBeDefined();
		});

		it("declares the vaultSecret schema", () => {
			expect(plugin.schema).toBeDefined();
			expect(plugin.schema!.vaultSecret).toBeDefined();
			expect(plugin.schema!.vaultSecret.fields.encryptedValue).toBeDefined();
			expect(plugin.schema!.vaultSecret.fields.iv).toBeDefined();
			expect(plugin.schema!.vaultSecret.fields.version).toBeDefined();
		});
	});

	// ─── Base64 Encoding ────────────────────────────────────────────────

	describe("uint8ToBase64 / base64ToUint8", () => {
		it("round-trips empty array", () => {
			const original = new Uint8Array(0);
			const encoded = uint8ToBase64(original);
			const decoded = base64ToUint8(encoded);
			expect(decoded).toEqual(original);
		});

		it("round-trips a known byte sequence", () => {
			const original = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
			const encoded = uint8ToBase64(original);
			expect(encoded).toBe(btoa("Hello"));
			const decoded = base64ToUint8(encoded);
			expect(decoded).toEqual(original);
		});

		it("round-trips random bytes", () => {
			const original = new Uint8Array(64);
			crypto.getRandomValues(original);
			const encoded = uint8ToBase64(original);
			const decoded = base64ToUint8(encoded);
			expect(decoded).toEqual(original);
		});

		it("handles all 256 byte values", () => {
			const original = new Uint8Array(256);
			for (let i = 0; i < 256; i++) {
				original[i] = i;
			}
			const decoded = base64ToUint8(uint8ToBase64(original));
			expect(decoded).toEqual(original);
		});
	});

	// ─── Key Derivation ─────────────────────────────────────────────────

	describe("deriveKey()", () => {
		it("derives a CryptoKey from a master secret", async () => {
			const key = await deriveKey("test-master-secret", 1);
			expect(key).toBeDefined();
			expect(key.type).toBe("secret");
			expect(key.algorithm).toMatchObject({ name: "AES-GCM", length: 256 });
		});

		it("produces different keys for different versions (cross-decrypt fails)", async () => {
			// Encrypt with version 1, attempt decrypt with version 2 key
			const { encryptedValue, iv } = await encryptValue("test", "same-secret", 1);
			await expect(decryptValue(encryptedValue, iv, "same-secret", 2)).rejects.toThrow();
		});

		it("produces different keys for different secrets (cross-decrypt fails)", async () => {
			const { encryptedValue, iv } = await encryptValue("test", "secret-a", 1);
			await expect(decryptValue(encryptedValue, iv, "secret-b", 1)).rejects.toThrow();
		});

		it("produces the same key for same inputs (deterministic decryption)", async () => {
			const secret = "deterministic-test";
			const { encryptedValue, iv } = await encryptValue("deterministic", secret, 5);
			// Decrypting with same secret + version should work
			const result = await decryptValue(encryptedValue, iv, secret, 5);
			expect(result).toBe("deterministic");
		});

		it("key is not extractable (non-exportable)", async () => {
			const key = await deriveKey("test", 1);
			expect(key.extractable).toBe(false);
		});
	});

	// ─── Encrypt / Decrypt Round-Trip ───────────────────────────────────

	describe("encryptValue / decryptValue", () => {
		const secret = "test-master-secret-for-round-trip";

		it("encrypts and decrypts a simple string", async () => {
			const plaintext = "hello world";
			const { encryptedValue, iv } = await encryptValue(plaintext, secret, 1);
			const decrypted = await decryptValue(encryptedValue, iv, secret, 1);
			expect(decrypted).toBe(plaintext);
		});

		it("encrypts and decrypts an empty string", async () => {
			const plaintext = "";
			const { encryptedValue, iv } = await encryptValue(plaintext, secret, 1);
			const decrypted = await decryptValue(encryptedValue, iv, secret, 1);
			expect(decrypted).toBe(plaintext);
		});

		it("encrypts and decrypts unicode text", async () => {
			const plaintext = "Hello from the vault. Secret key: s3cr3t!";
			const { encryptedValue, iv } = await encryptValue(plaintext, secret, 1);
			const decrypted = await decryptValue(encryptedValue, iv, secret, 1);
			expect(decrypted).toBe(plaintext);
		});

		it("produces different ciphertexts for the same plaintext (random IV)", async () => {
			const plaintext = "same text twice";
			const result1 = await encryptValue(plaintext, secret, 1);
			const result2 = await encryptValue(plaintext, secret, 1);
			// IVs should differ (96 bits of randomness)
			expect(result1.iv).not.toBe(result2.iv);
			// Ciphertexts should also differ
			expect(result1.encryptedValue).not.toBe(result2.encryptedValue);
		});

		it("fails to decrypt with wrong version", async () => {
			const { encryptedValue, iv } = await encryptValue("secret data", secret, 1);
			await expect(decryptValue(encryptedValue, iv, secret, 2)).rejects.toThrow();
		});

		it("fails to decrypt with wrong master secret", async () => {
			const { encryptedValue, iv } = await encryptValue("secret data", secret, 1);
			await expect(decryptValue(encryptedValue, iv, "wrong-secret", 1)).rejects.toThrow();
		});

		it("fails to decrypt with tampered ciphertext", async () => {
			const { encryptedValue, iv } = await encryptValue("integrity check", secret, 1);
			// Flip a byte in the base64 ciphertext
			const bytes = base64ToUint8(encryptedValue);
			bytes[0] = bytes[0]! ^ 0xff;
			const tampered = uint8ToBase64(bytes);
			await expect(decryptValue(tampered, iv, secret, 1)).rejects.toThrow();
		});

		it("supports key rotation across versions", async () => {
			// Encrypt with version 1
			const plaintext = "rotate me";
			const { encryptedValue: enc1, iv: iv1 } = await encryptValue(plaintext, secret, 1);
			// Encrypt with version 2
			const { encryptedValue: enc2, iv: iv2 } = await encryptValue(plaintext, secret, 2);

			// Both decrypt correctly with their respective versions
			expect(await decryptValue(enc1, iv1, secret, 1)).toBe(plaintext);
			expect(await decryptValue(enc2, iv2, secret, 2)).toBe(plaintext);

			// Cross-version decryption fails
			await expect(decryptValue(enc1, iv1, secret, 2)).rejects.toThrow();
			await expect(decryptValue(enc2, iv2, secret, 1)).rejects.toThrow();
		});

		it("handles large payloads", async () => {
			const plaintext = "A".repeat(100_000);
			const { encryptedValue, iv } = await encryptValue(plaintext, secret, 1);
			const decrypted = await decryptValue(encryptedValue, iv, secret, 1);
			expect(decrypted).toBe(plaintext);
		});
	});
});
