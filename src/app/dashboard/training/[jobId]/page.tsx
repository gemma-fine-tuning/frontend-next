"use client";

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
	const [inferenceOpen, setInferenceOpen] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [inferenceResult, setInferenceResult] = useState<string | null>(null);
	const [inferenceLoading, setInferenceLoading] = useState(false);
	const [inferenceError, setInferenceError] = useState<string | null>(null);

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

	useEffect(() => {
		cancelled.current = false;
		fetchStatus();
		return () => {
			cancelled.current = true;
			if (polling.current) clearTimeout(polling.current);
		};
	}, [fetchStatus]);

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
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Inference failed");
			setInferenceResult(data.result || JSON.stringify(data));
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
									<div className="mt-8">
										<Button
											variant="outline"
											disabled
											className="w-full opacity-60 cursor-not-allowed"
										>
											Batch Inference (to come...)
										</Button>
									</div>
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
