function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

export const PREPROCESS_SERVICE_URL = requireEnv("PREPROCESS_SERVICE_URL");
export const INFERENCE_SERVICE_URL = requireEnv("INFERENCE_SERVICE_URL");
export const TRAIN_SERVICE_URL = requireEnv("TRAIN_SERVICE_URL");
export const HF_TOKEN = requireEnv("HF_TOKEN");
