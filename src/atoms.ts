import { atom } from "jotai";

/* ********** Datasets Atoms ********** */
export type DatasetSample = {
	datasetName: string;
	datasetId: string;
	datasetSource: "huggingface" | "local";
	datasetSubset: string;
	numExamples: number;
	createdAt: string;
	splits: string[];
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
	row: Record<string, string>;
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

export const datasetProcessingLoadingAtom = atom(false);

/* ********** Dataset Configuration Atoms ********** */
