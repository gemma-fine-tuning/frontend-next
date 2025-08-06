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
import type {
	ApiErrorResponse,
	EvaluationRequest,
	EvaluationResponse,
	MetricType,
	TaskType,
} from "@/types/inference";
import type { TrainingJob } from "@/types/training";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

interface EvaluationFormProps {
	job: TrainingJob;
}

const TASK_TYPES: { value: TaskType; label: string }[] = [
	{ value: "conversation", label: "Conversation" },
	{ value: "qa", label: "Question Answering" },
	{ value: "summarization", label: "Summarization" },
	{ value: "translation", label: "Translation" },
	{ value: "classification", label: "Classification" },
	{ value: "general", label: "General" },
];

const METRIC_TYPES: { value: MetricType; label: string }[] = [
	{ value: "rouge", label: "ROUGE" },
	{ value: "bertscore", label: "BERTScore" },
	{ value: "accuracy", label: "Accuracy" },
	{ value: "exact_match", label: "Exact Match" },
	{ value: "bleu", label: "BLEU" },
	{ value: "meteor", label: "METEOR" },
	{ value: "recall", label: "Recall" },
	{ value: "precision", label: "Precision" },
	{ value: "f1", label: "F1 Score" },
];

export default function EvaluationForm({ job }: EvaluationFormProps) {
	const [dataset, setDataset] = useState<string>(
		job.processed_dataset_id || "",
	);
	const [evaluationType, setEvaluationType] = useState<"task" | "metrics">(
		"task",
	);
	const [taskType, setTaskType] = useState<TaskType>("conversation");
	const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([]);
	const [maxSamples, setMaxSamples] = useState<string>("");
	const [numSampleResults, setNumSampleResults] = useState<string>("3");
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<EvaluationResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	function handleMetricToggle(metric: MetricType, checked: boolean) {
		if (checked) {
			setSelectedMetrics(prev => [...prev, metric]);
		} else {
			setSelectedMetrics(prev => prev.filter(m => m !== metric));
		}
	}

	async function runEvaluation() {
		setLoading(true);
		setError(null);
		setResults(null);
		try {
			if (!job.adapter_path || !job.base_model_id) {
				throw new Error("Job is missing adapter path or base model ID");
			}

			const requestBody: EvaluationRequest = {
				adapter_path: job.adapter_path,
				base_model_id: job.base_model_id,
				dataset_id: dataset,
				num_sample_results: Number.parseInt(numSampleResults) || 3,
			};

			if (evaluationType === "task") {
				requestBody.task_type = taskType;
			} else {
				requestBody.metrics = selectedMetrics;
			}

			if (maxSamples) {
				requestBody.max_samples = Number.parseInt(maxSamples);
			}

			const res = await fetch("/api/evaluation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});
			const data = (await res.json()) as
				| EvaluationResponse
				| ApiErrorResponse;
			if (!res.ok)
				throw new Error(
					(data as ApiErrorResponse).error || "Evaluation failed",
				);
			setResults(data as EvaluationResponse);
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
			<div className="space-y-6">
				<div>
					<Label htmlFor="dataset">Dataset Name</Label>
					<Input
						id="dataset"
						value={dataset}
						onChange={e => setDataset(e.target.value)}
						placeholder="Enter dataset name..."
						disabled={loading}
						className="mt-2"
					/>
				</div>

				<div>
					<Label>Evaluation Type</Label>
					<div className="flex gap-4 mt-3">
						<label className="flex items-center gap-2">
							<input
								type="radio"
								name="evaluationType"
								value="task"
								checked={evaluationType === "task"}
								onChange={e =>
									setEvaluationType(e.target.value as "task")
								}
								disabled={loading}
							/>
							Task Type (Recommended)
						</label>
						<label className="flex items-center gap-2">
							<input
								type="radio"
								name="evaluationType"
								value="metrics"
								checked={evaluationType === "metrics"}
								onChange={e =>
									setEvaluationType(
										e.target.value as "metrics",
									)
								}
								disabled={loading}
							/>
							Specific Metrics
						</label>
					</div>
				</div>

				{evaluationType === "task" ? (
					<div>
						<Label htmlFor="taskType">Task Type</Label>
						<Select
							value={taskType}
							onValueChange={(value: TaskType) =>
								setTaskType(value)
							}
							disabled={loading}
						>
							<SelectTrigger className="mt-2">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TASK_TYPES.map(type => (
									<SelectItem
										key={type.value}
										value={type.value}
									>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				) : (
					<div>
						<Label>Select Metrics</Label>
						<div className="grid grid-cols-2 gap-2 mt-3">
							{METRIC_TYPES.map(metric => (
								<div
									key={metric.value}
									className="flex items-center space-x-2"
								>
									<Checkbox
										id={metric.value}
										checked={selectedMetrics.includes(
											metric.value,
										)}
										onCheckedChange={checked =>
											handleMetricToggle(
												metric.value,
												checked as boolean,
											)
										}
										disabled={loading}
									/>
									<Label
										htmlFor={metric.value}
										className="text-sm"
									>
										{metric.label}
									</Label>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="maxSamples">
							Max Samples (Optional)
						</Label>
						<Input
							id="maxSamples"
							type="number"
							value={maxSamples}
							onChange={e => setMaxSamples(e.target.value)}
							placeholder="All samples"
							disabled={loading}
							className="mt-2"
						/>
					</div>
					<div>
						<Label htmlFor="numSampleResults">
							Sample Results to Show
						</Label>
						<Input
							id="numSampleResults"
							type="number"
							value={numSampleResults}
							onChange={e => setNumSampleResults(e.target.value)}
							placeholder="3"
							disabled={loading}
							className="mt-2"
						/>
					</div>
				</div>

				<Button
					onClick={runEvaluation}
					disabled={
						!dataset ||
						(evaluationType === "metrics" &&
							selectedMetrics.length === 0) ||
						loading
					}
					className="w-fit"
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

			{error && (
				<div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200">
					{error}
				</div>
			)}

			{results && (
				<div className="space-y-6">
					<div>
						<h3 className="font-semibold text-lg mb-4">
							Evaluation Results
						</h3>
						<div className="grid gap-4">
							<div className="bg-muted p-4 rounded-lg">
								<div className="text-sm text-muted-foreground mb-2">
									Evaluated {results.num_samples} samples from
									dataset: {results.dataset_id}
								</div>
							</div>

							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
								{Object.entries(results.metrics).map(
									([metric, value]) => (
										<div
											key={metric}
											className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border"
										>
											<div className="text-lg font-bold text-blue-700 min-h-[2rem] flex items-start">
												{formatMetricValue(value)}
											</div>
											<div className="text-sm text-blue-600 font-medium capitalize mt-2">
												{metric.replace("_", " ")}
											</div>
										</div>
									),
								)}
							</div>
						</div>
					</div>

					{results.samples.length > 0 && (
						<div>
							<h4 className="font-semibold mb-4">
								Sample Results
							</h4>
							<div className="space-y-4">
								{results.samples.map((sample, index) => (
									<div
										key={sample.sample_index}
										className="border rounded-lg p-4 space-y-3 bg-muted/50"
									>
										<div className="text-sm font-medium text-muted-foreground">
											Sample #{sample.sample_index + 1}
										</div>

										{sample.input && (
											<div>
												<span className="text-xs text-muted-foreground block mb-2">
													Input:
												</span>
												<div className="bg-input/10 p-3 rounded text-sm">
													<MessageDisplay
														messages={parseMessages(
															sample.input,
														)}
													/>
												</div>
											</div>
										)}

										<div>
											<span className="text-xs text-muted-foreground block mb-2">
												Model Prediction:
											</span>
											<div className="bg-input/10 p-3 rounded text-sm whitespace-pre-wrap">
												{sample.prediction}
											</div>
										</div>

										<div>
											<span className="text-xs text-muted-foreground block mb-2">
												Ground Truth:
											</span>
											<div className="bg-input/10 p-3 rounded text-sm whitespace-pre-wrap">
												{sample.reference}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
