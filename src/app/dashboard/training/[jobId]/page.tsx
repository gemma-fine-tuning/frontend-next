"use client";

import { jobCacheAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import type { InferenceResponse } from "@/types/inference";
import type { TrainingJob } from "@/types/training";
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
			const res = await fetch("/api/inference", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					adapter_path: job?.adapter_path,
					base_model_id: job?.base_model_id,
					prompt,
				}),
			});
			const data = (await res.json()) as InferenceResponse;
			if (!res.ok) throw new Error("Inference failed");
			setInferenceResult(data.result);
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
		<div className="max-w-4xl mx-auto py-8 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Training Job
					</h1>
					<p className="text-muted-foreground mt-1">
						Monitor and manage your training job
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchStatus(true)}
						disabled={refreshing}
						className="flex items-center gap-2"
					>
						<RefreshCw
							className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
					{job.status === "completed" && job.adapter_path && (
						<Sheet
							open={inferenceOpen}
							onOpenChange={setInferenceOpen}
						>
							<SheetTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="flex items-center gap-2"
								>
									Try Inference
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-96">
								<SheetHeader>
									<SheetTitle>Try Inference</SheetTitle>
									<SheetDescription>
										Test your trained model with a custom
										prompt
									</SheetDescription>
								</SheetHeader>
								<div className="flex flex-col gap-4 mt-6">
									<div className="space-y-2">
										<label
											htmlFor="prompt"
											className="text-sm font-medium"
										>
											Prompt
										</label>
										<Input
											id="prompt"
											value={prompt}
											onChange={e =>
												setPrompt(e.target.value)
											}
											placeholder="Enter your prompt here..."
											disabled={inferenceLoading}
										/>
									</div>
									<Button
										onClick={handleInference}
										disabled={
											!prompt.trim() || inferenceLoading
										}
										className="w-full"
									>
										{inferenceLoading ? (
											<>
												<Loader2 className="animate-spin w-4 h-4 mr-2" />
												Running...
											</>
										) : (
											"Run Inference"
										)}
									</Button>
									{inferenceError && (
										<div className="text-red-600 text-sm p-3 bg-red-50 rounded border">
											{inferenceError}
										</div>
									)}
									{inferenceResult && (
										<div className="space-y-2">
											<span className="text-sm font-medium">
												Result:
											</span>
											<div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap max-h-60 overflow-auto border">
												{inferenceResult}
											</div>
										</div>
									)}
								</div>
								<SheetFooter className="mt-6">
									<SheetClose asChild>
										<Button variant="outline">Close</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					)}
				</div>
			</div>

			{/* Status Banner */}
			<div
				className={`p-4 rounded-lg border ${
					job.status === "completed"
						? "bg-green-50 border-green-200"
						: job.status === "failed"
							? "bg-red-50 border-red-200"
							: job.status === "training"
								? "bg-blue-50 border-blue-200"
								: "bg-yellow-50 border-yellow-200"
				}`}
			>
				<div className="flex items-center gap-3">
					<div
						className={`w-3 h-3 rounded-full ${
							job.status === "completed"
								? "bg-green-500"
								: job.status === "failed"
									? "bg-red-500"
									: job.status === "training"
										? "bg-blue-500 animate-pulse"
										: "bg-yellow-500 animate-pulse"
						}`}
					/>
					<div>
						<p className="font-medium capitalize text-gray-900">
							{job.status || "Unknown"}
						</p>
						<p className="text-sm text-muted-foreground">
							{job.status === "completed" &&
								"Training completed successfully"}
							{job.status === "failed" && "Training failed"}
							{job.status === "training" &&
								"Training in progress..."}
							{job.status === "preparing" &&
								"Preparing training environment..."}
							{job.status === "queued" &&
								"Job queued for processing"}
						</p>
					</div>
				</div>
			</div>

			{/* Job Information Cards */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Job Information
						</h3>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Job ID
								</span>
								<p className="text-sm font-mono break-all bg-muted px-2 py-1 rounded mt-1">
									{jobId}
								</p>
							</div>
							{job.job_name && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Job Name
									</span>
									<p className="mt-1">{job.job_name}</p>
								</div>
							)}
							{job.modality && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Modality
									</span>
									<p className="mt-1 capitalize">
										{job.modality}
									</p>
								</div>
							)}
							{job.base_model_id && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Base Model
									</span>
									<p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
										{job.base_model_id}
									</p>
								</div>
							)}
							{job.processed_dataset_id && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Dataset
									</span>
									<p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
										{job.processed_dataset_id}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Output Information */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Output & Resources
						</h3>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							{job.adapter_path && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Adapter Path
									</span>
									<p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1 break-all">
										{job.adapter_path}
									</p>
								</div>
							)}
							{job.gguf_path && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										GGUF Path
									</span>
									<p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1 break-all">
										{job.gguf_path}
									</p>
								</div>
							)}
							{job.wandb_url && (
								<div>
									<span className="text-sm font-medium text-muted-foreground">
										Weights & Biases
									</span>
									<a
										href={job.wandb_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 block"
									>
										View Training Logs →
									</a>
								</div>
							)}
							{job.error && (
								<div>
									<span className="text-sm font-medium text-muted-foreground text-red-600">
										Error
									</span>
									<div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded mt-1 border border-red-200">
										{job.error}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Evaluation Metrics */}
			{job.metrics && (
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Evaluation Metrics
						</h3>
						<p className="text-sm text-muted-foreground">
							Performance metrics from training evaluation
						</p>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-3 gap-4">
							{job.metrics.accuracy !== undefined && (
								<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border">
									<div className="text-2xl font-bold text-blue-700">
										{(job.metrics.accuracy * 100).toFixed(
											2,
										)}
										%
									</div>
									<div className="text-sm text-blue-600 font-medium">
										Accuracy
									</div>
								</div>
							)}
							{job.metrics.perplexity !== undefined && (
								<div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border">
									<div className="text-2xl font-bold text-green-700">
										{job.metrics.perplexity.toFixed(3)}
									</div>
									<div className="text-sm text-green-600 font-medium">
										Perplexity
									</div>
								</div>
							)}
							{job.metrics.eval_loss !== undefined && (
								<div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border">
									<div className="text-2xl font-bold text-purple-700">
										{job.metrics.eval_loss.toFixed(4)}
									</div>
									<div className="text-sm text-purple-600 font-medium">
										Evaluation Loss
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Actions */}
			{job.status === "completed" && job.adapter_path && (
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">
							Available Actions
						</h3>
						<p className="text-sm text-muted-foreground">
							What you can do with your trained model
						</p>
					</CardHeader>
					<CardContent>
						<div className="flex gap-3">
							<Link
								href={`/dashboard/training/${jobId}/batch`}
								className="flex-1"
							>
								<Button variant="outline" className="w-full">
									Batch Inference
								</Button>
							</Link>
							<Link
								href={`/dashboard/training/${jobId}/evaluation`}
								className="flex-1"
							>
								<Button variant="outline" className="w-full">
									Evaluate Model
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
