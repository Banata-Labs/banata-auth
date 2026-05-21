function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const env = {
	appUrl: process.env.APP_URL?.trim() || "http://localhost:3002",
	port: Number(process.env.PORT || 8787),
	banataApiKey: requireEnv("BANATA_API_KEY"),
	banataAuthUrl: process.env.BANATA_AUTH_URL?.trim() || "https://auth.banata.dev",
};
