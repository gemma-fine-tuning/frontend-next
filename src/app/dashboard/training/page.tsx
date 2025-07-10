"use client";

import { jobsAtom, jobsLoadingAtom } from "@/atoms";
import TrainingJobCard from "@/components/training-job-card";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { Loader2, PlusIcon, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function TrainingJobsPage() {
	const [jobs, setJobs] = useAtom(jobsAtom);
	const [loading, setLoading] = useAtom(jobsLoadingAtom);

	useEffect(() => {
		fetchJobs();
	}, []);

	async function fetchJobs() {
		setLoading(true);
		try {
			const res = await fetch("/api/jobs");
			const data = await res.json();
			setJobs(data.jobs || []);
		} catch (err: unknown) {
			setJobs([]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Training Jobs</h1>
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => fetchJobs()}
						disabled={loading}
						aria-label="Refresh jobs"
					>
						<RefreshCw className={loading ? "animate-spin" : ""} />
					</Button>
					<Link href="/dashboard/training/new/model">
						<Button variant="outline">
							<PlusIcon className="w-4 h-4 mr-2" /> New Training
							Job
						</Button>
					</Link>
				</div>
			</div>
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-8 h-8 animate-spin" />
						<p className="text-muted-foreground">Loading jobs...</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{jobs.map(job => (
						<Link
							key={job.job_id}
							href={`/dashboard/training/${job.job_id}`}
						>
							<TrainingJobCard job={job} />
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
