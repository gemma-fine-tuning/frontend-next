function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

export const API_GATEWAY_URL = requireEnv("API_GATEWAY_URL");
export const HF_TOKEN = requireEnv("HF_TOKEN");
