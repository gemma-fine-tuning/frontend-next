"use client";

import { datasetsAtom, datasetsLoadingAtom } from "@/atoms";
import DatasetCard from "@/components/dataset-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { Loader2, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const Dashboard = () => {
	const [datasets, setDatasets] = useAtom(datasetsAtom);
	const [isLoading, setIsLoading] = useAtom(datasetsLoadingAtom);

	useEffect(() => {
		const fetchDatasets = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("http://localhost:8000/datasets");
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

	// Show only the first 3 datasets
	const recentDatasets = datasets.slice(0, 3);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground mt-2">
					Welcome to your AI training dashboard
				</p>
			</div>

			{/* Datasets Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Recent Datasets</h2>
					<Link
						href="/dashboard/datasets"
						className={cn(buttonVariants({ variant: "outline" }))}
					>
						All Datasets
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
				) : recentDatasets.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{recentDatasets.map(dataset => (
							<DatasetCard
								key={dataset.datasetId}
								dataset={dataset}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-muted-foreground mb-4">
							No datasets found. Create your first dataset to get
							started.
						</p>
						<Link
							href="/dashboard/datasets/selection"
							className={cn(buttonVariants())}
						>
							<PlusIcon className="w-4 h-4 mr-2" />
							Add Dataset
						</Link>
					</div>
				)}
			</div>

			{/* Models Section - Placeholder for future */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Models</h2>
					<Link
						href="/dashboard/models"
						className={cn(buttonVariants({ variant: "outline" }))}
					>
						All Models
					</Link>
				</div>
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
					<p className="text-muted-foreground">
						Models section coming soon...
					</p>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
