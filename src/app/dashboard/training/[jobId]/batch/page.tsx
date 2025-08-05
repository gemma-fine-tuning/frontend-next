"use client";

import { jobCacheAtom } from "@/atoms";
import BatchInferenceForm from "@/components/batch-inference-form";
import { Button } from "@/components/ui/button";
import type { TrainingJob } from "@/types/training";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function BatchInferencePage() {
	const { jobId } = useParams<{ jobId: string }>();
	const router = useRouter();
	const cache = useAtomValue(jobCacheAtom);
	const [job, setJob] = useState<TrainingJob | null>(
		cache[jobId as string] ?? null,
	);
	const [loading, setLoading] = useState(!job);
	const [error, setError] = useState<string | null>(null);

	const fetchJob = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/jobs/${jobId}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch job");
			setJob(data);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}, [jobId]);

	useEffect(() => {
		if (!job) {
			fetchJob();
		}
	}, [fetchJob, job]);

	if (loading)
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 animate-spin" />
			</div>
		);
	if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
	if (!job) return <div className="p-8">Job not found.</div>;
	if (job.status !== "completed" || !job.adapter_path)
		return (
			<div className="p-8">
				Batch inference available only for completed jobs.
			</div>
		);

	return (
		<div className="max-w-5xl mx-auto py-8 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Batch Inference</h1>
				<Button variant="secondary" onClick={() => router.back()}>
					Back
				</Button>
			</div>
			<BatchInferenceForm job={job} />
		</div>
	);
}
