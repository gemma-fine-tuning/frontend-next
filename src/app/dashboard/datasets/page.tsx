"use client";

import { datasetsAtom, datasetsLoadingAtom } from "@/atoms";
import DatasetCard from "@/components/dataset-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { Loader2, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const Datasets = () => {
	const [datasets, setDatasets] = useAtom(datasetsAtom);
	const [isLoading, setIsLoading] = useAtom(datasetsLoadingAtom);

	useEffect(() => {
		const fetchDatasets = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("http://localhost:8080/datasets");
				const data = await response.json();

				const formattedData = data.datasets.map(
					(dataset: {
						dataset_name: string;
						dataset_id: string;
						dataset_source: "upload" | "huggingface";
						dataset_subset: string;
						num_examples: number;
						created_at: string;
						splits: string[];
					}) => ({
						datasetName: dataset.dataset_name,
						datasetId: dataset.dataset_id,
						datasetSource:
							dataset.dataset_source === "upload"
								? "local"
								: "huggingface",
						datasetSubset: dataset.dataset_subset,
						numExamples: dataset.num_examples,
						createdAt: dataset.created_at,
						splits: dataset.splits,
					}),
				);
				setDatasets(formattedData);
			} catch (error) {
				console.error("Failed to fetch datasets:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchDatasets();
	}, [setDatasets, setIsLoading]);

	return (
		<div>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">All Datasets</h1>
				<Link
					href="/dashboard/datasets/selection"
					className={cn(buttonVariants({ variant: "outline" }))}
				>
					<PlusIcon className="w-4 h-4" />
					Add Dataset
				</Link>
			</div>
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">
							Loading datasets...
						</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{datasets.map(dataset => (
						<DatasetCard
							key={dataset.datasetId}
							dataset={dataset}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default Datasets;
