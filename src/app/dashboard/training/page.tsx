"use client";

import TrainingJobCard from "@/components/training-job-card";
import { Button } from "@/components/ui/button";
import { useTrainingJobs } from "@/hooks/useTrainingJobs";
import { Loader2, PlusIcon } from "lucide-react";
import Link from "next/link";

export default function TrainingJobsPage() {
	const { jobs, loading, error } = useTrainingJobs();

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Training Jobs</h1>
				<Link href="/dashboard/training/new/model">
					<Button variant="outline">
						<PlusIcon className="w-4 h-4 mr-2" /> New Training Job
					</Button>
				</Link>
			</div>
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">Loading jobs...</p>
					</div>
				</div>
			) : error ? (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">{error}</p>
				</div>
			) : jobs.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{jobs.map(job => (
						<TrainingJobCard key={job.job_id} job={job} />
					))}
				</div>
			) : (
				<div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg space-y-6">
					<p className="text-muted-foreground">
						No training jobs yet. Start a training job to see it
						here.
					</p>
				</div>
			)}
		</div>
	);
}
