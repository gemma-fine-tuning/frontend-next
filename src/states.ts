import { atom } from "jotai";

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

// Rows for dataset preview: array of { row: Record<string, string> }
export type DatasetPreviewRow = {
	row: Record<string, string>;
};
export const hfDatasetPreviewRowsAtom = atom<DatasetPreviewRow[]>([]);
