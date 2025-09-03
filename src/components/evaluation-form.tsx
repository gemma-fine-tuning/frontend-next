import { MessageDisplay } from "@/components/message-display";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { DatasetMessage } from "@/types/dataset";
import type { EvaluationResponse, SampleResult } from "@/types/inference";
import type { TrainingJob } from "@/types/training";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

interface EvaluationFormProps {
	job?: TrainingJob;
	adapterPath?: string;
	baseModelId?: string;
	initialDatasetId?: string;
}

const TASK_TYPES = [
	{ value: "text_generation", label: "Text Generation" },
	{ value: "text_classification", label: "Text Classification" },
	{ value: "question_answering", label: "Question Answering" },
	{ value: "summarization", label: "Summarization" },
];

const METRIC_TYPES = [
	{ value: "bleu", label: "BLEU Score" },
	{ value: "rouge", label: "ROUGE Score" },
	{ value: "bert_score", label: "BERTScore" },
	{ value: "meteor", label: "METEOR" },
	{ value: "accuracy", label: "Accuracy" },
	{ value: "f1", label: "F1 Score" },
	{ value: "perplexity", label: "Perplexity" },
];

export default function EvaluationForm({
	job,
	adapterPath,
	baseModelId,
	initialDatasetId,
}: EvaluationFormProps) {
	// Determine model configuration from props
	const effectiveAdapterPath = adapterPath || job?.adapter_path;
	const effectiveBaseModelId = baseModelId || job?.base_model_id;
	const effectiveDatasetId =
		initialDatasetId || job?.processed_dataset_id || "";

	const [dataset, setDataset] = useState<string>(effectiveDatasetId);
	const [evaluationType, setEvaluationType] = useState<string>("automatic");
	const [taskType, setTaskType] = useState<string>("text_generation");
	const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
		new Set(["bleu", "rouge"]),
	);
	const [maxSamples, setMaxSamples] = useState<number>(100);
	const [numSampleResults, setNumSampleResults] = useState<number>(3);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<EvaluationResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	function handleMetricToggle(metric: string) {
		setSelectedMetrics(prev => {
			const newSet = new Set(prev);
			if (newSet.has(metric)) {
				newSet.delete(metric);
			} else {
				newSet.add(metric);
			}
			return newSet;
		});
	}

	async function runEvaluation() {
		if (!effectiveAdapterPath || !effectiveBaseModelId) {
			setError("Evaluation requires adapter path and base model ID");
			return;
		}

		setLoading(true);
		setError(null);
		setResults(null);

		try {
			const config = {
				adapter_path: effectiveAdapterPath,
				base_model_id: effectiveBaseModelId,
				dataset_id: dataset,
				evaluation_type: evaluationType,
				task_type: taskType,
				metrics: Array.from(selectedMetrics),
				max_samples: maxSamples,
				num_sample_results: numSampleResults,
			};

			const response = await fetch("/api/evaluation", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(config),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			const result = await response.json();
			setResults(result as EvaluationResponse);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	function formatMetricValue(
		value: number | Record<string, number>,
	): ReactElement | string {
		if (typeof value === "number") {
			return value.toFixed(4);
		}

		// Handle nested metrics as a table
		return (
			<div className="space-y-1">
				{Object.entries(value).map(([key, val]) => (
					<div key={key} className="flex justify-between text-xs">
						<span className="text-muted-foreground capitalize">
							{key.replace(/_/g, " ")}:
						</span>
						<span className="font-medium">
							{typeof val === "number"
								? val.toFixed(4)
								: String(val)}
						</span>
					</div>
				))}
			</div>
		);
	}

	function parseMessages(input: Array<DatasetMessage>): DatasetMessage[] {
		try {
			return input as DatasetMessage[];
		} catch {
			return [];
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2 space-y-4">
				<label htmlFor="dataset" className="font-semibold">
					Dataset ID
				</label>
				<span className="text-sm text-muted-foreground">
					You can find dataset IDs in your dataset management
					dashboard.
				</span>
				<Input
					id="dataset"
					value={dataset}
					onChange={e => setDataset(e.target.value)}
					placeholder="Enter dataset ID..."
					disabled={loading}
				/>
			</div>

			{error && <div className="text-red-600 text-sm">{error}</div>}

			<div className="space-y-4">
				<div className="flex flex-col gap-2">
					<Label className="font-semibold">Evaluation Type</Label>
					<Select
						value={evaluationType}
						onValueChange={value =>
							setEvaluationType(value as "task" | "metrics")
						}
						disabled={loading}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="task">Task-based</SelectItem>
							<SelectItem value="metrics">
								Metrics-based
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{evaluationType === "task" && (
					<div className="flex flex-col gap-2">
						<Label className="font-semibold">Task Type</Label>
						<Select
							value={taskType}
							onValueChange={setTaskType}
							disabled={loading}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TASK_TYPES.map(
									(task: {
										value: string;
										label: string;
									}) => (
										<SelectItem
											key={task.value}
											value={task.value}
										>
											{task.label}
										</SelectItem>
									),
								)}
							</SelectContent>
						</Select>
					</div>
				)}

				{evaluationType === "metrics" && (
					<div className="flex flex-col gap-3">
						<Label className="font-semibold">Select Metrics</Label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{METRIC_TYPES.map(
								(metric: { value: string; label: string }) => (
									<div
										key={metric.value}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={`metric-${metric.value}`}
											checked={selectedMetrics.has(
												metric.value,
											)}
											onCheckedChange={checked =>
												handleMetricToggle(metric.value)
											}
											disabled={loading}
										/>
										<Label
											htmlFor={`metric-${metric.value}`}
											className="text-sm"
										>
											{metric.label}
										</Label>
									</div>
								),
							)}
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4">
					<div className="flex flex-col gap-2">
						<Label className="font-semibold">Max Samples</Label>
						<Input
							value={maxSamples.toString()}
							onChange={e =>
								setMaxSamples(
									Number.parseInt(e.target.value) || 0,
								)
							}
							placeholder="Leave empty for all"
							type="number"
							min="1"
							disabled={loading}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label className="font-semibold">Sample Results</Label>
						<Input
							value={numSampleResults.toString()}
							onChange={e =>
								setNumSampleResults(
									Number.parseInt(e.target.value) || 0,
								)
							}
							placeholder="3"
							type="number"
							min="1"
							max="10"
							disabled={loading}
						/>
					</div>
				</div>

				<Button
					onClick={runEvaluation}
					disabled={
						loading ||
						!dataset ||
						(evaluationType === "metrics" &&
							selectedMetrics.size === 0)
					}
					className="w-full"
				>
					{loading ? (
						<>
							<Loader2 className="animate-spin w-4 h-4 mr-2" />
							Running Evaluation...
						</>
					) : (
						"Run Evaluation"
					)}
				</Button>
			</div>

			{results && (
				<div className="space-y-4">
					<div className="font-semibold">Evaluation Results</div>

					{results.metrics &&
						Object.keys(results.metrics).length > 0 && (
							<div className="space-y-3">
								<div className="font-medium text-sm text-muted-foreground">
									Metrics
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{Object.entries(results.metrics).map(
										([metric, value]) => (
											<div
												key={metric}
												className="p-3 border rounded-lg space-y-2"
											>
												<div className="font-medium capitalize">
													{metric.replace(/_/g, " ")}
												</div>
												<div className="text-sm">
													{formatMetricValue(
														value as
															| number
															| Record<
																	string,
																	number
															  >,
													)}
												</div>
											</div>
										),
									)}
								</div>
							</div>
						)}

					{results.samples && results.samples.length > 0 && (
						<div className="space-y-3">
							<div className="font-medium text-sm text-muted-foreground">
								Sample Results
							</div>
							<div className="grid gap-4">
								{results.samples.map(
									(sample: SampleResult, idx: number) => {
										const sampleKey = `sample-${sample.sample_index}-${sample.prediction?.slice(0, 10) || idx}`;
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
														Input:
													</div>
													<MessageDisplay
														messages={parseMessages(
															sample.input || [],
														)}
													/>
												</div>
												<div>
													<div className="text-sm font-medium mb-2">
														Expected Output:
													</div>
													<div className="p-2 bg-green-50 rounded border text-sm">
														{sample.reference}
													</div>
												</div>
												<div>
													<div className="text-sm font-medium mb-2">
														Model Output:
													</div>
													<div className="p-2 bg-blue-50 rounded border text-sm">
														{sample.prediction}
													</div>
												</div>
											</div>
										);
									},
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
