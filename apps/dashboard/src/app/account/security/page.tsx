"use client";

import { useBackendStatus } from "@/components/backend-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import {
	Check,
	Copy,
	Globe,
	Key,
	Loader2,
	Lock,
	LogOut,
	Monitor,
	Shield,
	ShieldCheck,
	ShieldOff,
	Smartphone,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface SessionInfo {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
}

function parseUserAgent(ua?: string | null): { browser: string; os: string } {
	if (!ua) return { browser: "Unknown", os: "Unknown" };
	let browser = "Unknown";
	let os = "Unknown";

	if (ua.includes("Firefox")) browser = "Firefox";
	else if (ua.includes("Edg/")) browser = "Edge";
	else if (ua.includes("Chrome")) browser = "Chrome";
	else if (ua.includes("Safari")) browser = "Safari";

	if (ua.includes("Windows")) os = "Windows";
	else if (ua.includes("Mac OS")) os = "macOS";
	else if (ua.includes("Linux")) os = "Linux";
	else if (ua.includes("Android")) os = "Android";
	else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

	return { browser, os };
}

export default function SecurityPage() {
	const { data: session } = authClient.useSession();
	const currentSessionToken = session?.session?.token;
	const user = session?.user;
	const twoFactorEnabled = (user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled;

	// Password change
	const [changingPassword, setChangingPassword] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);

	// MFA setup
	const [mfaStep, setMfaStep] = useState<"idle" | "enabling" | "verify" | "backup" | "disabling">(
		"idle",
	);
	const [mfaPassword, setMfaPassword] = useState("");
	const [totpUri, setTotpUri] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verifyCode, setVerifyCode] = useState("");
	const [mfaLoading, setMfaLoading] = useState(false);
	const [copiedCodes, setCopiedCodes] = useState(false);

	// Sessions
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [loadingSessions, setLoadingSessions] = useState(true);
	const [revokingSession, setRevokingSession] = useState<string | null>(null);

	const { reportError } = useBackendStatus();

	// Load sessions
	useEffect(() => {
		authClient
			.listSessions()
			.then((res: { data?: unknown }) => {
				if (res.data) {
					setSessions(res.data as SessionInfo[]);
				}
			})
			.catch((err: unknown) => {
				reportError(err);
			})
			.finally(() => setLoadingSessions(false));
	}, [reportError]);

	// ── Password Change ──

	const handleChangePassword = useCallback(async () => {
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		setSavingPassword(true);
		try {
			const res = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: false,
			});
			if (res.error) {
				toast.error(res.error.message ?? "Failed to change password");
			} else {
				toast.success("Password changed successfully");
				setChangingPassword(false);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
			}
		} catch {
			toast.error("Failed to change password");
		} finally {
			setSavingPassword(false);
		}
	}, [currentPassword, newPassword, confirmPassword]);

	// ── MFA Enable Flow ──

	const handleStartMfaEnable = useCallback(async () => {
		if (!mfaPassword) {
			toast.error("Password required to enable 2FA");
			return;
		}
		setMfaLoading(true);
		try {
			const res = await authClient.twoFactor.enable({
				password: mfaPassword,
			});
			if (res.error) {
				toast.error(res.error.message ?? "Failed to enable 2FA");
			} else if (res.data) {
				setTotpUri(res.data.totpURI);
				setBackupCodes(res.data.backupCodes);
				setMfaStep("verify");
			}
		} catch {
			toast.error("Failed to enable 2FA");
		} finally {
			setMfaLoading(false);
		}
	}, [mfaPassword]);

	const handleVerifyTotp = useCallback(async () => {
		if (!verifyCode || verifyCode.length !== 6) {
			toast.error("Enter a 6-digit code");
			return;
		}
		setMfaLoading(true);
		try {
			const res = await authClient.twoFactor.verifyTotp({
				code: verifyCode,
			});
			if (res.error) {
				toast.error(res.error.message ?? "Invalid code");
			} else {
				setMfaStep("backup");
				toast.success("Two-factor authentication enabled!");
			}
		} catch {
			toast.error("Verification failed");
		} finally {
			setMfaLoading(false);
		}
	}, [verifyCode]);

	const handleDisableMfa = useCallback(async () => {
		if (!mfaPassword) {
			toast.error("Password required to disable 2FA");
			return;
		}
		setMfaLoading(true);
		try {
			const res = await authClient.twoFactor.disable({
				password: mfaPassword,
			});
			if (res.error) {
				toast.error(res.error.message ?? "Failed to disable 2FA");
			} else {
				toast.success("Two-factor authentication disabled");
				setMfaStep("idle");
				setMfaPassword("");
			}
		} catch {
			toast.error("Failed to disable 2FA");
		} finally {
			setMfaLoading(false);
		}
	}, [mfaPassword]);

	const handleRegenerateBackupCodes = useCallback(async () => {
		if (!mfaPassword) {
			toast.error("Password required");
			return;
		}
		setMfaLoading(true);
		try {
			const res = await authClient.twoFactor.generateBackupCodes({
				password: mfaPassword,
			});
			if (res.error) {
				toast.error(res.error.message ?? "Failed to generate backup codes");
			} else if (res.data) {
				setBackupCodes(res.data.backupCodes);
				setCopiedCodes(false);
				toast.success("New backup codes generated");
			}
		} catch {
			toast.error("Failed to generate backup codes");
		} finally {
			setMfaLoading(false);
		}
	}, [mfaPassword]);

	const copyBackupCodes = () => {
		navigator.clipboard.writeText(backupCodes.join("\n"));
		setCopiedCodes(true);
		setTimeout(() => setCopiedCodes(false), 2000);
	};

	// ── Session Management ──

	const handleRevokeSession = useCallback(async (token: string) => {
		setRevokingSession(token);
		try {
			const res = await authClient.revokeSession({ token });
			if (res.error) {
				toast.error(res.error.message ?? "Failed to revoke session");
			} else {
				setSessions((prev) => prev.filter((s) => s.token !== token));
				toast.success("Session revoked");
			}
		} catch {
			toast.error("Failed to revoke session");
		} finally {
			setRevokingSession(null);
		}
	}, []);

	const handleRevokeOtherSessions = useCallback(async () => {
		try {
			const res = await authClient.revokeOtherSessions();
			if (res.error) {
				toast.error(res.error.message ?? "Failed to revoke sessions");
			} else {
				setSessions((prev) => prev.filter((s) => s.token === currentSessionToken));
				toast.success("All other sessions revoked");
			}
		} catch {
			toast.error("Failed to revoke sessions");
		}
	}, [currentSessionToken]);

	return (
		<div className="grid gap-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Security</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage your password, two-factor authentication, and active sessions.
				</p>
			</div>

			{/* Password */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Lock className="size-4 text-muted-foreground" />
							<div>
								<CardTitle className="text-sm">Password</CardTitle>
								<CardDescription>Change your account password.</CardDescription>
							</div>
						</div>
						{!changingPassword && (
							<Button variant="outline" size="sm" onClick={() => setChangingPassword(true)}>
								<Key className="size-3.5" />
								Change password
							</Button>
						)}
					</div>
				</CardHeader>
				{changingPassword && (
					<CardContent>
						<div className="grid gap-4 max-w-sm">
							<div className="grid gap-2">
								<Label htmlFor="current-password">Current password</Label>
								<Input
									id="current-password"
									type="password"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new-password">New password</Label>
								<Input
									id="new-password"
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="confirm-password">Confirm new password</Label>
								<Input
									id="confirm-password"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
								{confirmPassword && newPassword !== confirmPassword && (
									<p className="text-xs text-red-400">Passwords do not match</p>
								)}
							</div>
							<div className="flex gap-2">
								<Button
									onClick={handleChangePassword}
									disabled={
										savingPassword ||
										!currentPassword ||
										!newPassword ||
										newPassword !== confirmPassword
									}
									size="sm"
								>
									{savingPassword ? (
										<>
											<Loader2 className="size-3.5 animate-spin" />
											Saving...
										</>
									) : (
										"Update password"
									)}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setChangingPassword(false);
										setCurrentPassword("");
										setNewPassword("");
										setConfirmPassword("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					</CardContent>
				)}
			</Card>

			{/* Two-Factor Authentication */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Shield className="size-4 text-muted-foreground" />
							<div>
								<CardTitle className="text-sm">Two-Factor Authentication</CardTitle>
								<CardDescription>
									Add an extra layer of security with TOTP-based two-factor authentication.
								</CardDescription>
							</div>
						</div>
						{twoFactorEnabled ? (
							<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
								<ShieldCheck className="mr-1 size-3" />
								Enabled
							</Badge>
						) : (
							<Badge variant="secondary" className="text-muted-foreground">
								<ShieldOff className="mr-1 size-3" />
								Disabled
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{mfaStep === "idle" && (
						<div className="space-y-4">
							{twoFactorEnabled ? (
								<div className="space-y-4">
									<p className="text-sm text-muted-foreground">
										Two-factor authentication is active. You will be prompted for a TOTP code when
										signing in.
									</p>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" onClick={() => setMfaStep("disabling")}>
											<ShieldOff className="size-3.5" />
											Disable 2FA
										</Button>
										<Button variant="outline" size="sm" onClick={() => setMfaStep("enabling")}>
											<Key className="size-3.5" />
											Regenerate backup codes
										</Button>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									<p className="text-sm text-muted-foreground">
										Two-factor authentication adds an extra layer of security to your account. When
										enabled, you will need to enter a code from your authenticator app in addition
										to your password when signing in.
									</p>
									<Button size="sm" onClick={() => setMfaStep("enabling")}>
										<Shield className="size-3.5" />
										Enable two-factor authentication
									</Button>
								</div>
							)}
						</div>
					)}

					{mfaStep === "enabling" && (
						<div className="space-y-4 max-w-sm">
							<p className="text-sm text-muted-foreground">
								{twoFactorEnabled
									? "Enter your password to regenerate backup codes."
									: "Enter your password to set up two-factor authentication."}
							</p>
							<div className="grid gap-2">
								<Label htmlFor="mfa-password">Password</Label>
								<Input
									id="mfa-password"
									type="password"
									value={mfaPassword}
									onChange={(e) => setMfaPassword(e.target.value)}
								/>
							</div>
							<div className="flex gap-2">
								<Button
									onClick={twoFactorEnabled ? handleRegenerateBackupCodes : handleStartMfaEnable}
									disabled={mfaLoading || !mfaPassword}
									size="sm"
								>
									{mfaLoading ? (
										<>
											<Loader2 className="size-3.5 animate-spin" />
											{twoFactorEnabled ? "Regenerating..." : "Setting up..."}
										</>
									) : twoFactorEnabled ? (
										"Generate new codes"
									) : (
										"Continue"
									)}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setMfaStep("idle");
										setMfaPassword("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{mfaStep === "verify" && (
						<div className="space-y-4 max-w-sm">
							<p className="text-sm text-muted-foreground">
								Scan the QR code below with your authenticator app (Google Authenticator, Authy,
								1Password, etc.), then enter the 6-digit code to verify.
							</p>

							{/* TOTP URI display (for copy) */}
							<div className="rounded-lg border bg-muted/30 p-4 space-y-2">
								<p className="text-xs text-muted-foreground">
									If you cannot scan the QR code, manually enter this key in your authenticator app:
								</p>
								<code className="block text-xs font-mono break-all text-primary">
									{totpUri.split("secret=")[1]?.split("&")[0] ?? totpUri}
								</code>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="verify-code">Verification code</Label>
								<Input
									id="verify-code"
									value={verifyCode}
									onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
									placeholder="000000"
									maxLength={6}
									className="font-mono text-center text-lg tracking-widest max-w-[200px]"
								/>
							</div>
							<div className="flex gap-2">
								<Button
									onClick={handleVerifyTotp}
									disabled={mfaLoading || verifyCode.length !== 6}
									size="sm"
								>
									{mfaLoading ? (
										<>
											<Loader2 className="size-3.5 animate-spin" />
											Verifying...
										</>
									) : (
										<>
											<Check className="size-3.5" />
											Verify & enable
										</>
									)}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setMfaStep("idle");
										setVerifyCode("");
										setTotpUri("");
										setMfaPassword("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{mfaStep === "backup" && (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Save these backup codes in a secure location. Each code can only be used once. If
								you lose access to your authenticator app, you can use a backup code to sign in.
							</p>

							<div className="rounded-lg border bg-muted/30 p-4">
								<div className="grid grid-cols-2 gap-2">
									{backupCodes.map((code) => (
										<code key={code} className="text-sm font-mono text-primary">
											{code}
										</code>
									))}
								</div>
							</div>

							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={copyBackupCodes}>
									{copiedCodes ? (
										<>
											<Check className="size-3.5 text-emerald-500" />
											Copied
										</>
									) : (
										<>
											<Copy className="size-3.5" />
											Copy codes
										</>
									)}
								</Button>
								<Button
									size="sm"
									onClick={() => {
										setMfaStep("idle");
										setMfaPassword("");
										setVerifyCode("");
										setTotpUri("");
										setBackupCodes([]);
									}}
								>
									Done
								</Button>
							</div>
						</div>
					)}

					{mfaStep === "disabling" && (
						<div className="space-y-4 max-w-sm">
							<p className="text-sm text-muted-foreground">
								Enter your password to disable two-factor authentication. This will make your
								account less secure.
							</p>
							<div className="grid gap-2">
								<Label htmlFor="disable-mfa-password">Password</Label>
								<Input
									id="disable-mfa-password"
									type="password"
									value={mfaPassword}
									onChange={(e) => setMfaPassword(e.target.value)}
								/>
							</div>
							<div className="flex gap-2">
								<Button
									variant="destructive"
									onClick={handleDisableMfa}
									disabled={mfaLoading || !mfaPassword}
									size="sm"
								>
									{mfaLoading ? (
										<>
											<Loader2 className="size-3.5 animate-spin" />
											Disabling...
										</>
									) : (
										"Disable 2FA"
									)}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setMfaStep("idle");
										setMfaPassword("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Active Sessions */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Monitor className="size-4 text-muted-foreground" />
							<div>
								<CardTitle className="text-sm">Active Sessions</CardTitle>
								<CardDescription>Manage devices where you are currently signed in.</CardDescription>
							</div>
						</div>
						{sessions.length > 1 && (
							<Button variant="outline" size="sm" onClick={handleRevokeOtherSessions}>
								<LogOut className="size-3.5" />
								Sign out other devices
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{loadingSessions ? (
						<div className="space-y-3">
							{["session-1", "session-2", "session-3"].map((key) => (
								<SkeletonListRow key={key} />
							))}
						</div>
					) : sessions.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4 text-center">No active sessions.</p>
					) : (
						<div className="space-y-3">
							{sessions.map((sess) => {
								const isCurrent = sess.token === currentSessionToken;
								const { browser, os } = parseUserAgent(sess.userAgent);
								const DeviceIcon = os === "iOS" || os === "Android" ? Smartphone : Monitor;

								return (
									<div
										key={sess.id}
										className="flex items-center justify-between rounded-lg border px-4 py-3"
									>
										<div className="flex items-center gap-3">
											<DeviceIcon className="size-4 text-muted-foreground" />
											<div>
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium">
														{browser} on {os}
													</p>
													{isCurrent && (
														<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
															Current
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													{sess.ipAddress && (
														<span className="flex items-center gap-1">
															<Globe className="size-3" />
															{sess.ipAddress}
														</span>
													)}
													<span>
														Started{" "}
														{new Date(sess.createdAt).toLocaleDateString(undefined, {
															month: "short",
															day: "numeric",
															year: "numeric",
														})}
													</span>
												</div>
											</div>
										</div>
										{!isCurrent && (
											<Button
												variant="ghost"
												size="sm"
												className="text-muted-foreground hover:text-red-400"
												disabled={revokingSession === sess.token}
												onClick={() => handleRevokeSession(sess.token)}
											>
												{revokingSession === sess.token ? (
													<Loader2 className="size-3.5 animate-spin" />
												) : (
													<>
														<LogOut className="size-3.5" />
														Revoke
													</>
												)}
											</Button>
										)}
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
