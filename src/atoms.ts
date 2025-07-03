import { atom } from "jotai";

/* ********** Dataset Selection Atoms ********** */
// Hugging Face Dataset
export const hfDatasetIdAtom = atom("");
export const hfDatasetConfigsAtom = atom<string[]>([]);
export const hfDatasetConfigsLoadingAtom = atom(false);
export const hfDatasetSelectedConfigAtom = atom("");

export const hfDatasetSplitsLoadingAtom = atom(false);
type HFDatasetSplit = {
	name: string;
	num_examples: number;
};
export const hfDatasetSplitsAtom = atom<HFDatasetSplit[]>([]);
export const hfDatasetSelectedSplitAtom = atom("");

export const hfDatasetPreviewLoadingAtom = atom(false);

export type DatasetPreviewRow = {
	row: Record<string, string>;
};
export const hfDatasetPreviewRowsAtom = atom<DatasetPreviewRow[]>([]);

// Local Dataset
export const localDatasetAtom = atom<File | null>(null);
export const localDatasetPreviewLoadingAtom = atom(false);
export const localDatasetIdAtom = atom("");
export const localDatasetPreviewRowsAtom = atom<DatasetPreviewRow[]>([]);

// Final state for configuration
export type DatasetSelectionType = {
	type: "huggingface" | "local";
	datasetId: string;
	split?: string;
	config?: string;
	rows: DatasetPreviewRow[];
};
export const datasetSelectionAtom = atom<DatasetSelectionType | null>(null);
/* ********** Dataset Selection Atoms ********** */
