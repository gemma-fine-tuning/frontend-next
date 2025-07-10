"use client";

import { jobCacheAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { InferenceResult, TrainingJob } from "@/types/training";
import { useAtomValue, useSetAtom } from "jotai";
import { Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function JobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const cache = useAtomValue(jobCacheAtom);
	const [job, setJob] = useState<TrainingJob | null>(
		cache[jobId as string] ?? null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [inferenceOpen, setInferenceOpen] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [inferenceResult, setInferenceResult] = useState<string | null>(null);
	const [inferenceLoading, setInferenceLoading] = useState(false);
	const [inferenceError, setInferenceError] = useState<string | null>(null);
	const setJobCache = useSetAtom(jobCacheAtom);

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
					setJobCache(prev => ({ ...prev, [jobId as string]: data }));
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
		[jobId, setJobCache],
	);

	useEffect(() => {
		cancelled.current = false;
		fetchStatus();
		return () => {
			cancelled.current = true;
			if (polling.current) clearTimeout(polling.current);
		};
	}, [fetchStatus]);

	useEffect(() => {
		// stop polling once job is completed or failed
		if (job && ["completed", "failed"].includes(job.status ?? "")) {
			if (polling.current) {
				clearTimeout(polling.current);
				polling.current = null;
			}
		}
	}, [job]);

	async function handleInference() {
		setInferenceLoading(true);
		setInferenceError(null);
		setInferenceResult(null);
		try {
			const storageType = job?.adapter_path?.startsWith("gs://")
				? "gcs"
				: "hfhub";
			const res = await fetch("/api/inference", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					job_id_or_repo_id: jobId,
					prompt,
					storage_type: storageType,
				}),
			});
			const data = (await res.json()) as InferenceResult;
			if (!res.ok) throw new Error("Inference failed");
			setInferenceResult(data.response);
		} catch (err: unknown) {
			setInferenceError(err instanceof Error ? err.message : String(err));
		} finally {
			setInferenceLoading(false);
		}
	}

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
				<div className="flex gap-2">
					<button
						type="button"
						className="p-2 rounded hover:bg-muted transition-colors"
						onClick={() => fetchStatus(true)}
						disabled={refreshing}
						aria-label="Refresh job status"
					>
						<RefreshCw
							className={refreshing ? "animate-spin" : ""}
						/>
					</button>
					{job.status === "completed" && job.adapter_path && (
						<Sheet
							open={inferenceOpen}
							onOpenChange={setInferenceOpen}
						>
							<SheetTrigger asChild>
								<Button variant="outline">Try Inference</Button>
							</SheetTrigger>
							<SheetContent side="right">
								<SheetHeader>
									<SheetTitle>Try Inference</SheetTitle>
									<SheetDescription>
										Enter a prompt to run single inference
										on this trained model.
									</SheetDescription>
								</SheetHeader>
								<div className="flex flex-col gap-4 p-4">
									<label htmlFor="prompt">Prompt</label>
									<Input
										id="prompt"
										value={prompt}
										onChange={e =>
											setPrompt(e.target.value)
										}
										placeholder="Enter your prompt here..."
										disabled={inferenceLoading}
									/>
									<Button
										onClick={handleInference}
										disabled={
											!prompt.trim() || inferenceLoading
										}
									>
										{inferenceLoading ? (
											<Loader2 className="animate-spin w-4 h-4" />
										) : (
											"Run Inference"
										)}
									</Button>
									{inferenceError && (
										<div className="text-red-600 text-sm">
											{inferenceError}
										</div>
									)}
									{inferenceResult && (
										<div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
											<strong>Result:</strong>
											<div>{inferenceResult}</div>
										</div>
									)}
									{/* Single inference only. Batch inference is available as separate page. */}
								</div>
								<SheetFooter>
									<SheetClose asChild>
										<Button variant="secondary">
											Close
										</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					)}
				</div>
			</div>
			<Card className="p-6">
				<h2 className="text-xl font-semibold mb-4">Job Details</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-2">
					<div className="text-muted-foreground">Job ID</div>
					<div className="break-all">{jobId}</div>
					<div className="text-muted-foreground">Status</div>
					<div>{job.status}</div>
					{job.base_model_id && (
						<>
							<div className="text-muted-foreground">
								Base Model
							</div>
							<div>{job.base_model_id}</div>
						</>
					)}
					{job.processed_dataset_id && (
						<>
							<div className="text-muted-foreground">
								Processed Dataset ID
							</div>
							<div>{job.processed_dataset_id}</div>
						</>
					)}
					{job.adapter_path && (
						<>
							<div className="text-muted-foreground">
								Adapter Path
							</div>
							<div className="break-all">{job.adapter_path}</div>
						</>
					)}
					{job.wandb_url && (
						<>
							<div className="text-muted-foreground">
								WandB URL
							</div>
							<div>
								<a
									href={job.wandb_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 underline"
								>
									{job.wandb_url}
								</a>
							</div>
						</>
					)}
					{job.error && (
						<>
							<div className="text-muted-foreground">Error</div>
							<div className="text-red-600">{job.error}</div>
						</>
					)}
				</div>
				{job.status === "completed" && job.adapter_path && (
					<Link href={`/dashboard/training/${jobId}/batch`}>
						<Button variant="outline" className="w-full">
							Batch Inference
						</Button>
					</Link>
				)}
			</Card>
		</div>
	);
}
