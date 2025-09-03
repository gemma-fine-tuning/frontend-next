import { MessageDisplay } from "@/components/message-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	DatasetDetail,
	DatasetMessage,
	DatasetSample,
	DatasetSplit,
} from "@/types/dataset";
import type { BatchInferenceResponse } from "@/types/inference";
import type { TrainingJob } from "@/types/training";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BatchInferenceFormProps {
	job?: TrainingJob;
	adapterPath?: string;
	baseModelId?: string;
	initialDatasetId?: string;
	// Comparison mode props
	isComparison?: boolean;
	modelLabel?: string; // "Model 1", "Model 2", etc.
	// Pre-selected samples for comparison mode
	preSelectedSamples?: DatasetSample[];
	sharedDatasetId?: string;
}

function getSampleKey(sample: DatasetSample): string {
	try {
		return JSON.stringify(sample.messages || sample.prompt || sample);
	} catch {
		return String(Math.random());
	}
}

function getInferenceMessages(messages: DatasetMessage[]): DatasetMessage[] {
	return messages.filter(m => m.role !== "assistant");
}

function getGroundTruth(
	messages: DatasetMessage[],
): DatasetMessage | undefined {
	return messages.find(m => m.role === "assistant");
}

export default function BatchInferenceForm({
	job,
	adapterPath,
	baseModelId,
	initialDatasetId,
	isComparison = false,
	modelLabel,
	preSelectedSamples,
	sharedDatasetId,
}: BatchInferenceFormProps) {
	// Determine model configuration from props
	const effectiveAdapterPath = adapterPath || job?.adapter_path;
	const effectiveBaseModelId = baseModelId || job?.base_model_id;
	const effectiveDatasetId =
		sharedDatasetId || initialDatasetId || job?.processed_dataset_id || "";

	// Use pre-selected samples in comparison mode, otherwise use local state
	const [dataset, setDataset] = useState<string>(effectiveDatasetId);
	const [detail, setDetail] = useState<DatasetDetail | null>(null);
	const [splits, setSplits] = useState<DatasetSplit[]>([]);
	const [selectedSplit, setSelectedSplit] = useState<string>("");
	const [samples, setSamples] = useState<DatasetSample[]>([]);
	const [selected, setSelected] = useState<DatasetSample[]>(
		preSelectedSamples || [],
	);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Sync selected samples when preSelectedSamples changes (comparison mode)
	useEffect(() => {
		if (preSelectedSamples) {
			setSelected(preSelectedSamples);
		}
	}, [preSelectedSamples]);

	async function fetchSamples() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/datasets/${encodeURIComponent(dataset)}`,
			);
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || "Failed to fetch dataset");

			const detailData = data as DatasetDetail;
			setDetail(detailData);
			setSplits(detailData.splits);
			if (detailData.splits.length > 0) {
				const first = detailData.splits[0];
				setSelectedSplit(first.split_name);
				const languageModelingSamples = first.samples.filter(
					sample => sample.messages,
				);
				setSamples(languageModelingSamples.slice(0, 5));
				setSelected([]);
				setResults([]);
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	async function runBatchInference() {
		setLoading(true);
		setError(null);
		setResults([]);
		try {
			if (!effectiveAdapterPath || !effectiveBaseModelId) {
				throw new Error(
					"Batch inference requires adapter path and base model ID",
				);
			}

			const requestBody = {
				adapter_path: effectiveAdapterPath,
				base_model_id: effectiveBaseModelId,
				messages: selected.map(s =>
					getInferenceMessages(s.messages || []),
				),
			};

			const res = await fetch("/api/inference/batch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || "Batch inference failed");
			setResults((data as BatchInferenceResponse).results);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	function handleSplitChange(splitName: string) {
		setSelectedSplit(splitName);
		const split = splits.find(s => s.split_name === splitName);
		const languageModelingSamples =
			split?.samples.filter(sample => sample.messages) || [];
		setSamples(languageModelingSamples.slice(0, 5));
		setSelected([]);
		setResults([]);
	}

	function toggleSampleSelection(sample: DatasetSample) {
		setSelected(prev => {
			const exists = prev.some(
				s => getSampleKey(s) === getSampleKey(sample),
			);
			if (exists) {
				return prev.filter(
					s => getSampleKey(s) !== getSampleKey(sample),
				);
			}
			return [...prev, sample];
		});
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Show model label in comparison mode */}
			{isComparison && modelLabel && (
				<div className="text-center">
					<div className="text-sm font-medium text-muted-foreground bg-muted/50 rounded px-3 py-1 inline-block">
						{modelLabel}
					</div>
				</div>
			)}

			{/* Dataset selection - only show in single mode or if no pre-selected samples */}
			{!isComparison || !preSelectedSamples ? (
				<>
					<div className="flex flex-col gap-2 space-y-4">
						<Label
							htmlFor={`dataset-${modelLabel || "single"}`}
							className="font-semibold"
						>
							Dataset Name
						</Label>
						<div className="flex gap-2">
							<Input
								id={`dataset-${modelLabel || "single"}`}
								value={dataset}
								onChange={e => setDataset(e.target.value)}
								placeholder="Enter dataset name..."
								disabled={loading}
								className={`flex-1 ${isComparison ? "text-sm h-8" : ""}`}
							/>
							<Button
								onClick={fetchSamples}
								disabled={!dataset || loading}
								size={isComparison ? "sm" : "default"}
							>
								{loading ? (
									<Loader2
										className={`animate-spin ${isComparison ? "w-3 h-3" : "w-4 h-4"}`}
									/>
								) : (
									"Preview"
								)}
							</Button>
						</div>
					</div>
					{error && (
						<div className="text-red-600 text-sm">{error}</div>
					)}
					{splits.length > 0 && (
						<div className="flex items-center gap-2">
							<Label
								htmlFor={`split-${modelLabel || "single"}`}
								className={`font-semibold ${isComparison ? "text-sm" : ""}`}
							>
								Split:
							</Label>
							<Select
								value={selectedSplit}
								onValueChange={handleSplitChange}
							>
								<SelectTrigger
									id={`split-${modelLabel || "single"}`}
									size={isComparison ? "sm" : "default"}
								>
									<SelectValue placeholder="Select a split" />
								</SelectTrigger>
								<SelectContent>
									{splits.map((s: DatasetSplit) => (
										<SelectItem
											key={s.split_name}
											value={s.split_name}
										>
											{s.split_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					{splits.length > 0 && samples.length === 0 && (
						<div
							className={`p-4 bg-yellow-50 border border-yellow-200 rounded ${isComparison ? "text-xs p-3" : "text-sm"}`}
						>
							<p className="font-medium text-yellow-800">
								No samples available for batch inference
							</p>
							{!isComparison && (
								<p className="text-yellow-700 mt-1">
									This dataset appears to be in prompt-only
									format, which doesn't include assistant
									responses needed for batch inference
									comparison. Batch inference requires
									datasets in language modeling format with
									complete conversations.
								</p>
							)}
						</div>
					)}
					{samples.length > 0 && (
						<div className="space-y-4">
							<div
								className={`font-semibold ${isComparison ? "text-sm" : ""}`}
							>
								Select prompts (max 5)
							</div>
							<div className="grid gap-3">
								{samples.map((sample: DatasetSample) => (
									<label
										key={getSampleKey(sample)}
										className={`flex items-start gap-2 p-2 border rounded hover:bg-muted/50 cursor-pointer ${isComparison ? "p-1.5" : ""}`}
									>
										<input
											type="checkbox"
											checked={selected.some(
												(s: DatasetSample) =>
													getSampleKey(s) ===
													getSampleKey(sample),
											)}
											onChange={() =>
												toggleSampleSelection(sample)
											}
											className="mt-1"
										/>
										<div className="flex-1 min-w-0">
											<MessageDisplay
												messages={getInferenceMessages(
													sample.messages || [],
												)}
											/>
										</div>
									</label>
								))}
							</div>

							<Button
								onClick={runBatchInference}
								disabled={selected.length === 0 || loading}
								className={`w-full ${isComparison ? "h-8 text-sm" : ""}`}
							>
								{loading ? (
									<>
										<Loader2
											className={`animate-spin mr-2 ${isComparison ? "w-3 h-3" : "w-4 h-4"}`}
										/>
										{isComparison
											? "Running..."
											: "Running Inference..."}
									</>
								) : (
									`Run Batch Inference (${selected.length} samples)`
								)}
							</Button>
						</div>
					)}
				</>
			) : (
				// Comparison mode with pre-selected samples
				<div className="space-y-4">
					<div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
						<div className="font-medium mb-1">
							Using shared samples from dataset comparison
						</div>
						<div>Dataset: {sharedDatasetId}</div>
						<div>Selected samples: {preSelectedSamples.length}</div>
					</div>

					<Button
						onClick={runBatchInference}
						disabled={selected.length === 0 || loading}
						className={`w-full ${isComparison ? "h-8 text-sm" : ""}`}
					>
						{loading ? (
							<>
								<Loader2
									className={`animate-spin mr-2 ${isComparison ? "w-3 h-3" : "w-4 h-4"}`}
								/>
								Running...
							</>
						) : (
							`Run Batch Inference (${selected.length} samples)`
						)}
					</Button>
				</div>
			)}

			{results.length > 0 && (
				<div className="space-y-4">
					<div
						className={`font-semibold ${isComparison ? "text-sm" : ""}`}
					>
						{isComparison ? `${modelLabel} Results` : "Results"}
					</div>
					{isComparison ? (
						// Compact results for comparison mode
						<div className="space-y-2">
							{results.map((result: string, idx: number) => {
								const sample = selected[idx];
								const groundTruth = getGroundTruth(
									sample?.messages || [],
								);
								const sampleKey = sample
									? getSampleKey(sample)
									: `result-${idx}`;
								return (
									<div
										key={sampleKey}
										className="p-3 rounded border text-xs space-y-2"
									>
										<div className="font-medium text-xs text-muted-foreground">
											Sample {idx + 1}:
										</div>
										<div>
											<div className="font-medium text-xs text-blue-700 mb-1">
												{modelLabel} Response:
											</div>
											<div className="p-2 rounded text-xs">
												{result}
											</div>
										</div>
										{groundTruth && (
											<div>
												<div className="font-medium text-xs text-green-700 mb-1">
													Expected Response:
												</div>
												<div className="p-2 rounded text-xs">
													{typeof groundTruth.content ===
													"string"
														? groundTruth.content
														: Array.isArray(
																	groundTruth.content,
																)
															? groundTruth.content
																	.map(c =>
																		c.type ===
																		"text"
																			? c.text
																			: `[${c.type}]`,
																	)
																	.join("")
															: "[Complex content]"}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						// Full results for single mode
						<div className="grid gap-4">
							{results.map((result: string, idx: number) => {
								const sample = selected[idx];
								const groundTruth = getGroundTruth(
									sample?.messages || [],
								);
								const sampleKey = sample
									? getSampleKey(sample)
									: `result-${idx}`;
								return (
									<div
										key={sampleKey}
										className="space-y-3 p-4 border rounded-lg"
									>
										<div className="font-medium text-sm text-muted-foreground">
											Sample {idx + 1}
										</div>
										<div>
											<div className="text-sm font-medium mb-2">
												Prompt:
											</div>
											<MessageDisplay
												messages={getInferenceMessages(
													sample?.messages || [],
												)}
											/>
										</div>
										<div>
											<div className="text-sm font-medium mb-2">
												Model Response:
											</div>
											<div className="p-2 rounded border">
												{result}
											</div>
										</div>
										{groundTruth && (
											<div>
												<div className="text-sm font-medium mb-2">
													Expected Response:
												</div>
												<div className="p-2 rounded border">
													{typeof groundTruth.content ===
													"string"
														? groundTruth.content
														: Array.isArray(
																	groundTruth.content,
																)
															? groundTruth.content
																	.map(c =>
																		c.type ===
																		"text"
																			? c.text
																			: `[${c.type}]`,
																	)
																	.join("")
															: "[Complex content]"}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
