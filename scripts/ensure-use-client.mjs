import { readFile, writeFile } from "node:fs/promises";

const directive = '"use client";';
const files = process.argv.slice(2);

if (files.length === 0) {
	console.error("Usage: node ensure-use-client.mjs <file> [file...]");
	process.exit(1);
}

for (const file of files) {
	const source = await readFile(file, "utf8");
	if (source.startsWith(directive)) {
		continue;
	}

	await writeFile(file, `${directive}${source}`, "utf8");
}
