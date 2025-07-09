"use client";

import { Card } from "@/components/ui/card";
import type { TrainingJob } from "@/types/training";
import { Loader2, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function JobDetailPage() {
	const { jobId } = useParams();
	const [job, setJob] = useState<TrainingJob | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const cancelled = useRef(false);
	const polling = useRef<NodeJS.Timeout | null>(null);

	const fetchStatus = useCallback(
		async (manual = false) => {
			if (manual) setRefreshing(true);
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/jobs/${jobId}`);
				const data = await res.json();
				if (res.ok) {
					setJob(data);
					if (
						!manual &&
						!cancelled.current &&
						data.status &&
						!["completed", "failed"].includes(data.status)
					) {
						polling.current = setTimeout(() => fetchStatus(), 5000);
					}
				} else {
					setError(data.error || "Failed to fetch job status");
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setLoading(false);
				if (manual) setRefreshing(false);
			}
		},
		[jobId],
	);

	// eslint-disable-next-line
	useEffect(() => {
		cancelled.current = false;
		fetchStatus();
		return () => {
			cancelled.current = true;
			if (polling.current) clearTimeout(polling.current);
		};
	}, [fetchStatus]);

	if (loading)
		return (
			<div className="flex flex-col items-center gap-4 p-8">
				<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
				<span className="text-muted-foreground">
					Polling job status...
				</span>
			</div>
		);
	if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
	if (!job) return <div className="p-8">Job not found.</div>;

	return (
		<div className="max-w-2xl mx-auto py-8">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Job Details</h2>
				<button
					type="button"
					className="p-2 rounded hover:bg-muted transition-colors"
					onClick={() => fetchStatus(true)}
					disabled={refreshing}
					aria-label="Refresh job status"
				>
					<RefreshCw className={refreshing ? "animate-spin" : ""} />
				</button>
			</div>
			<Card className="p-6">
				<h2 className="text-xl font-semibold mb-4">Job Details</h2>
				<div className="mb-2">
					<strong>Job ID:</strong> {jobId}
				</div>
				<div className="mb-2">
					<strong>Status:</strong> {job.status}
				</div>
				{job.wandb_url && (
					<div className="mb-2">
						<strong>WandB URL:</strong>{" "}
						<a
							href={job.wandb_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 underline"
						>
							{job.wandb_url}
						</a>
					</div>
				)}
				{job.adapter_path && (
					<div className="mb-2">
						<strong>Adapter Path:</strong> {job.adapter_path}
					</div>
				)}
				{job.base_model_id && (
					<div className="mb-2">
						<strong>Base Model:</strong> {job.base_model_id}
					</div>
				)}
				{job.error && (
					<div className="mb-2 text-red-600">
						<strong>Error:</strong> {job.error}
					</div>
				)}
			</Card>
		</div>
	);
}
