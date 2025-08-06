import { atom } from "jotai";
import type { FieldMappings } from "./types/dataset";

/* ********** Datasets Atoms ********** */
export type DatasetSample = {
	datasetName: string;
	datasetId: string;
	datasetSource: "huggingface" | "local";
	datasetSubset: string;
	numExamples: number;
	createdAt: string;
	splits: string[];
	modality: "text" | "vision";
};
export const datasetsAtom = atom<DatasetSample[]>([]);
export const datasetsLoadingAtom = atom<boolean>(false);
/* ********** Datasets Atoms ********** */

/* ********** Dataset Selection Atoms ********** */
// Hugging Face Dataset
export const hfDatasetIdAtom = atom("");
export const hfDatasetConfigsAtom = atom<string[]>([]);
export const hfDatasetConfigsLoadingAtom = atom(false);
export const hfDatasetSelectedConfigAtom = atom("");

export const hfDatasetSplitsLoadingAtom = atom(false);
export type HFDatasetSplit = {
	name: string;
	num_examples: number;
};
export const hfDatasetSplitsAtom = atom<HFDatasetSplit[]>([]);
export const hfDatasetSelectedSplitAtom = atom("");

export const hfDatasetPreviewLoadingAtom = atom(false);
export const hfDatasetColumnsAtom = atom<string[]>([]);

export type DatasetPreviewRow = {
	row: Record<string, unknown>;
};
export const hfDatasetPreviewRowsAtom = atom<DatasetPreviewRow[]>([]);

// Local Dataset
export const localDatasetAtom = atom<File | null>(null);
export const localDatasetPreviewLoadingAtom = atom(false);
export const localDatasetIdAtom = atom("");
export const localDatasetColumnsAtom = atom<string[]>([]);
export const localDatasetPreviewRowsAtom = atom<DatasetPreviewRow[]>([]);
export const localDatasetSizeAtom = atom<number>(0);

// Final state for configuration
export type DatasetSelectionType = {
	type: "huggingface" | "local";
	datasetId: string;
	split?: string;
	availableSplits?: HFDatasetSplit[];
	config?: string;
	rows: DatasetPreviewRow[];
	columns: string[];
	modality?: "text" | "vision";
};
export const datasetSelectionAtom = atom<DatasetSelectionType | null>(null);
/* ********** Dataset Selection Atoms ********** */

/* ********** Dataset Configuration Atoms ********** */

export const datasetNameAtom = atom<string>("");

export type FieldMappingType = "column" | "template";

export type FieldMapping = {
	type: FieldMappingType;
	value: string;
};

// System Message Mapping
export const systemMessageColumnAtom = atom<string>("");
export const systemMessageTemplateAtom = atom<string>("");
export const systemMessageTabAtom = atom<FieldMappingType>("column");
export const systemMessageMappingAtom = atom<FieldMapping>({
	type: "column",
	value: "",
});

// User Message Mapping
export const userMessageColumnAtom = atom<string>("");
export const userMessageTemplateAtom = atom<string>("");
export const userMessageTabAtom = atom<FieldMappingType>("column");
export const userMessageMappingAtom = atom<FieldMapping>({
	type: "column",
	value: "",
});

// Assistant Message Mapping
export const assistantMessageColumnAtom = atom<string>("");
export const assistantMessageTemplateAtom = atom<string>("");
export const assistantMessageTabAtom = atom<FieldMappingType>("column");
export const assistantMessageMappingAtom = atom<FieldMapping>({
	type: "column",
	value: "",
});

// Vision Field Mapping
export const visionEnabledAtom = atom<boolean>(false);
export const visionFieldMappingAtom = atom<FieldMappings>({});

// Split Settings
export const splitTypeAtom = atom<"hf_split" | "manual_split" | "no_split">(
	"manual_split",
);
export const splitTestSizeAtom = atom<number>(0.2);
export const splitSampleSizeAtom = atom<number>(42);
export const splitHFSplitsAtom = atom<{ train: string; test: string }>({
	train: "",
	test: "",
});
export const splitSelectedSplitAtom = atom<HFDatasetSplit | null>(null);

// Dataset augmentation settings
export const datasetAugmentationAtom = atom<boolean>(false);
export const augmentationFactorAtom = atom<number>(1.5);
export const augmentationEDAAtom = atom<boolean>(false);
export const augmentationBackTranslationAtom = atom<boolean>(false);
export const augmentationParaphrasingAtom = atom<boolean>(false);
export const augmentationSynthesisAtom = atom<boolean>(false);
export const augmentationGeminiApiKeyAtom = atom<string | null>(null);
export const augmentationSynthesisRatioAtom = atom<number | null>(null);
export const augmentationCustomPromptAtom = atom<string | null>(null);

export const datasetProcessingLoadingAtom = atom(false);

/* ********** Dataset Configuration Atoms ********** */

/* ********** Training Job Creation Atoms ********** */
export type TrainingModelType = {
	modelId: string;
	provider: "unsloth" | "huggingface";
};
export const trainingModelAtom = atom<TrainingModelType | null>(null);
export const trainingDatasetIdAtom = atom<string>("");
export const trainingDatasetModalityAtom = atom<"text" | "vision" | null>(null);
export type TrainingConfigType = {
	method: "Full" | "LoRA" | "QLoRA" | "RL";
	base_model_id: string;
	lora_rank?: number;
	lora_alpha?: number;
	lora_dropout?: number;
	learning_rate: number;
	batch_size: number;
	gradient_accumulation_steps: number;
	epochs: number;
	max_steps?: number;
	packing?: boolean;
	use_fa2?: boolean;
	provider: "unsloth" | "huggingface";
	modality: "text" | "vision";
	max_seq_length?: number;
	lr_scheduler_type?: string;
	save_strategy?: string;
	logging_steps?: number;
	eval_strategy?: "no" | "steps" | "epoch";
	eval_steps?: number;
	compute_eval_metrics?: boolean;
	batch_eval_metrics?: boolean;
	// Export config
	export_format?: "adapter" | "merged";
	export_destination?: "gcs" | "hfhub";
	hf_repo_id?: string;
	include_gguf?: boolean;
	gguf_quantization?: "none" | "f16" | "bf16" | "q8_0" | "q4_k_m";
	// WandB config
	wandb_api_key?: string;
	wandb_project?: string;
	wandb_log_model?: "false" | "checkpoint" | "end";
	hf_token?: string;
};
export const trainingConfigAtom = atom<TrainingConfigType | null>(null);
export const trainingJobNameAtom = atom<string>("");
/* ********** Training Job Creation Atoms ********** */

/* ********** Training Jobs Atoms ********** */
import type { TrainingJob } from "@/types/training";
export const jobsAtom = atom<TrainingJob[]>([]);
export const jobsLoadingAtom = atom<boolean>(false);

/* ********** Job Cache Atom ********** */
export const jobCacheAtom = atom<Record<string, TrainingJob>>({});
/* ********** Job Cache Atom ********** */
