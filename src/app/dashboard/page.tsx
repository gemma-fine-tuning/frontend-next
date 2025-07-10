"use client";

import { datasetsAtom, datasetsLoadingAtom } from "@/atoms";
import DatasetCard from "@/components/dataset-card";
import TrainingJobCard from "@/components/training-job-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TrainingJob } from "@/types/training";
import { useAtom } from "jotai";
import { Loader2, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

const Dashboard = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground mt-2">
					Fine-tune SOTA open VLM with only a few clicks.
				</p>
			</div>
			<DatasetsSection />
			<TrainingJobsSection />
		</div>
	);
};

const DatasetsSection = () => {
	const [datasets, setDatasets] = useAtom(datasetsAtom);
	const [isLoading, setIsLoading] = useAtom(datasetsLoadingAtom);

	useEffect(() => {
		const fetchDatasets = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/datasets");
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

	const recentDatasets = datasets.slice(0, 3);

	return (
		<div className="p-6 space-y-4">
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
	);
};

const TrainingJobsSection = () => {
	const [jobs, setJobs] = useState<TrainingJob[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchJobs = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/jobs");
				const data = await res.json();
				setJobs(data.jobs || []);
			} catch {
				setJobs([]);
			} finally {
				setLoading(false);
			}
		};
		fetchJobs();
	}, []);

	const recentJobs = jobs.slice(0, 3);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Recent Training Jobs</h2>
				<Link
					href="/dashboard/training"
					className={cn(buttonVariants({ variant: "outline" }))}
				>
					All Jobs
				</Link>
			</div>
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-6 h-6 animate-spin" />
				</div>
			) : recentJobs.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{recentJobs.map(job => (
						<TrainingJobCard key={job.job_id} job={job} />
					))}
				</div>
			) : (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
					<p className="text-muted-foreground">
						No jobs yet. Start a training job to see it here.
					</p>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
