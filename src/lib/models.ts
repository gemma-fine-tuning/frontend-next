// Google/Hugging Face models (base models)
export const gemmaModelsPT = [
	"google/gemma-3-1b-pt",
	"google/gemma-3-4b-pt",
	"google/gemma-3-12b-pt",
	"google/gemma-3n-E2B",
	"google/gemma-3n-E4B",
	"google/gemma-3-270m",
];

export const gemmaModelsIT = [
	"google/gemma-3-1b-it",
	"google/gemma-3-4b-it",
	"google/gemma-3-12b-it",
	"google/gemma-3n-E2B-it",
	"google/gemma-3n-E4B-it",
	"google/gemma-3-270m-it",
];

// Unsloth models (standard)
export const unslothModelsPT = [
	"unsloth/gemma-3-1b-pt",
	"unsloth/gemma-3-4b-pt",
	"unsloth/gemma-3-12b-pt",
	"unsloth/gemma-3n-E4B",
	"unsloth/gemma-3n-E2B",
];

export const unslothModelsIT = [
	"unsloth/gemma-3-1b-it",
	"unsloth/gemma-3-4b-it",
	"unsloth/gemma-3-12b-it",
	"unsloth/gemma-3n-E4B-it",
	"unsloth/gemma-3n-E2B-it",
	"unsloth/gemma-3-270m-it",
];

// Unsloth 4-bit quantized models (dynamic quant)
export const unsloth4BitModelsPT = [
	"unsloth/gemma-3-1b-pt-unsloth-bnb-4bit",
	"unsloth/gemma-3-4b-pt-unsloth-bnb-4bit",
	"unsloth/gemma-3-12b-pt-unsloth-bnb-4bit",
	"unsloth/gemma-3n-E4B-unsloth-bnb-4bit",
	"unsloth/gemma-3n-E2B-unsloth-bnb-4bit",
];

export const unsloth4BitModelsIT = [
	"unsloth/gemma-3-1b-it-unsloth-bnb-4bit",
	"unsloth/gemma-3-4b-it-unsloth-bnb-4bit",
	"unsloth/gemma-3-12b-it-unsloth-bnb-4bit",
	"unsloth/gemma-3n-E4B-it-unsloth-bnb-4bit",
	"unsloth/gemma-3n-E2B-it-unsloth-bnb-4bit",
	"unsloth/gemma-3-270m-it-unsloth-bnb-4bit",
];

// All supported models (flat list for simple cases)
export const supportedModels = [
	...gemmaModelsPT,
	...gemmaModelsIT,
	...unslothModelsPT,
	...unslothModelsIT,
	...unsloth4BitModelsPT,
	...unsloth4BitModelsIT,
];

export const providerLabel = {
	huggingface: "Hugging Face",
	unsloth: "Unsloth",
} as const;

export type ModelProvider = keyof typeof providerLabel;
