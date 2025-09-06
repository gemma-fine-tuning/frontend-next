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

export interface GemmaModel {
	id: string;
	name: string;
	description: string;
}

export const gemmaModels: GemmaModel[] = [
	{
		id: "gemma-3-270m",
		name: "Gemma 3 270M",
		description: "Ultra-lightweight model, perfect for experimentation",
	},
	{
		id: "gemma-3-1b",
		name: "Gemma 3 1B",
		description:
			"Compact with good performance and low resource requirements",
	},
	{
		id: "gemma-3-4b",
		name: "Gemma 3 4B",
		description:
			"Balanced model providing excellent performance for most tasks",
	},
	{
		id: "gemma-3-12b",
		name: "Gemma 3 12B",
		description:
			"Large model delivering superior performance for complex tasks",
	},
	{
		id: "gemma-3n-E2B",
		name: "Gemma 3 E2B",
		description: "Efficient model optimized for edge deployment",
	},
	{
		id: "gemma-3n-E4B",
		name: "Gemma 3 E4B",
		description: "Enhanced efficient model with improved capabilities",
	},
];

export const trainingTypes = [
	{
		id: "it",
		name: "Instruction Tuning (IT)",
		description:
			"Fine-tune for chat, question-answering, and instruction-following tasks",
	},
	{
		id: "pt",
		name: "Pre-training (PT)",
		description:
			"General fine-tuning for custom tasks and domain adaptation",
	},
] as const;

export const providers = [
	{
		id: "huggingface",
		name: "Hugging Face",
		description: "Standard models from Google/Hugging Face",
	},
	{
		id: "unsloth",
		name: "Unsloth",
		description: "Optimized models for faster training (recommended)",
	},
] as const;

export type ModelProvider = (typeof providers)[number]["id"];
export type TrainingType = (typeof trainingTypes)[number]["id"];

// Supported model IDs for evaluation and other components
export const supportedModelIds = gemmaModels.map(model => model.id);
