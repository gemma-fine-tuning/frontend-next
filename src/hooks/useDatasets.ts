import { datasetsAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

export function useDatasets() {
	const [state, setState] = useAtom(datasetsAtom);
	const isFetching = useRef(false);

	const fetchDatasets = useCallback(async () => {
		if (isFetching.current) return; // Prevent concurrent calls

		try {
			isFetching.current = true;
			setState({
				datasets: [],
				loading: true,
				error: null,
				hasFetched: true,
			});

			const res = await fetch("/api/datasets");
			if (!res.ok) throw new Error("Failed to fetch datasets.");

			const data = await res.json();

			const formattedData = data.datasets.map(
				(dataset: {
					dataset_name: string;
					dataset_id: string;
					processed_dataset_id: string;
					dataset_source: "upload" | "huggingface";
					dataset_subset: string;
					num_examples: number;
					created_at: string;
					splits: string[];
					modality: "text" | "vision";
				}) => ({
					datasetName: dataset.dataset_name,
					datasetId: dataset.dataset_id,
					processed_dataset_id: dataset.processed_dataset_id,
					datasetSource:
						dataset.dataset_source === "upload"
							? "local"
							: "huggingface",
					datasetSubset: dataset.dataset_subset,
					numExamples: dataset.num_examples,
					createdAt: dataset.created_at,
					splits: dataset.splits,
					modality: dataset.modality,
				}),
			);

			setState({
				datasets: formattedData,
				loading: false,
				error: null,
				hasFetched: true,
			});
		} catch (error) {
			setState({
				datasets: [],
				loading: false,
				error: error instanceof Error ? error.message : "Unknown error",
				hasFetched: true,
			});
		} finally {
			isFetching.current = false;
		}
	}, [setState]);

	useEffect(() => {
		// Only fetch once if we haven't fetched before
		if (!state.hasFetched) {
			fetchDatasets();
		}
	}, [state.hasFetched, fetchDatasets]);

	return { ...state, refresh: fetchDatasets };
}
