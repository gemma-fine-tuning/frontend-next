"use client";

import DatasetCard from "@/components/dataset-card";
import TrainingJobCard from "@/components/training-job-card";
import { buttonVariants } from "@/components/ui/button";
import { useDatasets } from "@/hooks/useDatasets";
import { cn } from "@/lib/utils";
import type { TrainingJob } from "@/types/training";
import { Loader2, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
	const { datasets, loading, error } = useDatasets();

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
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">
							Loading datasets...
						</p>
					</div>
				</div>
			) : error ? (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">{error}</p>
				</div>
			) : recentDatasets.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{recentDatasets.map(dataset => (
						<DatasetCard
							key={dataset.datasetName}
							dataset={dataset}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">
						No datasets yet. Add a dataset to get started.
					</p>
					<Link
						href="/dashboard/datasets/selection"
						className={cn(buttonVariants({ size: "sm" }))}
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
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">Loading jobs...</p>
					</div>
				</div>
			) : recentJobs.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{recentJobs.map(job => (
						<TrainingJobCard key={job.job_id} job={job} />
					))}
				</div>
			) : (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">
						No jobs yet. Start a training job to see it here.
					</p>
					<Link
						href="/dashboard/datasets/new/model"
						className={cn(buttonVariants({ size: "sm" }))}
					>
						<PlusIcon className="w-4 h-4 mr-2" />
						Fine Tune Model
					</Link>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
