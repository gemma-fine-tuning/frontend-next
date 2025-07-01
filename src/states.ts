import { atom } from "jotai";

export const hfDatasetIdAtom = atom("");
export const hfDatasetConfigsAtom = atom<string[]>([]);
export const hfDatasetConfigsLoadingAtom = atom(false);
export const hfDatasetSelectedConfigAtom = atom("");
