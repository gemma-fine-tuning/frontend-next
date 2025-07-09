import type { DatasetDetail, DatasetDetailState } from "@/types/dataset";
import { useEffect, useState } from "react";

export const useDatasetDetail = (datasetName: string) => {
	const [state, setState] = useState<DatasetDetailState>({
		data: null,
		loading: true,
		error: null,
	});

	useEffect(() => {
		const fetchDatasetDetail = async () => {
			if (!datasetName) {
				setState({
					data: null,
					loading: false,
					error: "Dataset name is required",
				});
				return;
			}

			setState(prev => ({ ...prev, loading: true, error: null }));

			try {
				const response = await fetch(
					`http://localhost:8080/datasets/${encodeURIComponent(datasetName)}`,
				);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch dataset: ${response.status} ${response.statusText}`,
					);
				}

				const data: DatasetDetail = await response.json();
				setState({
					data,
					loading: false,
					error: null,
				});
			} catch (error) {
				setState({
					data: null,
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Unknown error occurred",
				});
			}
		};

		fetchDatasetDetail();
	}, [datasetName]);

	return state;
};
