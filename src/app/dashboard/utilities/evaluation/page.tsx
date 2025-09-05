"use client";

import BatchInferenceForm from "@/components/batch-inference-form";
import EvaluationForm from "@/components/evaluation-form";
import EvaluationModeSelector, {
	type EvaluationMode,
} from "@/components/evaluation-mode-selector";
import { MessageDisplay } from "@/components/message-display";
import ModelSelector, {
	type SelectedModel,
	type ComparisonModels,
} from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
	DatasetDetail,
	DatasetMessage,
	DatasetSample,
	DatasetSplit,
} from "@/types/dataset";
import type { TrainingJob } from "@/types/training";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function EvaluationPage() {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(
		null,
	);
	const [comparisonModels, setComparisonModels] = useState<ComparisonModels>({
		isComparison: false,
		model1: null,
		model2: null,
	});
	const [selectedMode, setSelectedMode] = useState<EvaluationMode | null>(
		null,
	);
	const [detailedJob, setDetailedJob] = useState<TrainingJob | null>(null);
	const [detailedJob1, setDetailedJob1] = useState<TrainingJob | null>(null);
	const [detailedJob2, setDetailedJob2] = useState<TrainingJob | null>(null);
	const [fetchingDetails, setFetchingDetails] = useState(false);

	// Shared dataset state for comparison mode
	const [sharedDataset, setSharedDataset] = useState<string>("");
	const [sharedDatasetDetail, setSharedDatasetDetail] =
		useState<DatasetDetail | null>(null);
	const [sharedSplits, setSharedSplits] = useState<DatasetSplit[]>([]);
	const [sharedSelectedSplit, setSharedSelectedSplit] = useState<string>("");
	const [sharedSamples, setSharedSamples] = useState<DatasetSample[]>([]);
	const [sharedSelected, setSharedSelected] = useState<DatasetSample[]>([]);
	const [sharedDatasetLoading, setSharedDatasetLoading] = useState(false);
	const [sharedDatasetError, setSharedDatasetError] = useState<string | null>(
		null,
	);

	// Prefill shared dataset when moving to step 3 in comparison mode
	const prefillSharedDataset = () => {
		if (!comparisonModels.isComparison) return;

		// Try to get dataset from model1 first, then model2, then empty
		const model1DatasetId =
			comparisonModels.model1?.type === "trained"
				? detailedJob1?.processed_dataset_id ||
					comparisonModels.model1?.job?.processed_dataset_id
				: undefined;
		const model2DatasetId =
			comparisonModels.model2?.type === "trained"
				? detailedJob2?.processed_dataset_id ||
					comparisonModels.model2?.job?.processed_dataset_id
				: undefined;

		const datasetToUse = model1DatasetId || model2DatasetId || "";
		setSharedDataset(datasetToUse);
	};

	// Helper function to get model configuration
	const getModelConfig = (
		model: SelectedModel | null,
		jobDetails?: TrainingJob | null,
	) => {
		if (!model) return null;

		return {
			job: model.type === "trained" ? jobDetails || model.job : undefined,
			adapterPath:
				model.type === "base"
					? model.modelId
					: jobDetails?.adapter_path || model.job?.adapter_path,
			baseModelId:
				model.type === "base"
					? model.modelId
					: jobDetails?.base_model_id || model.job?.base_model_id,
			initialDatasetId:
				model.type === "trained"
					? jobDetails?.processed_dataset_id ||
						model.job?.processed_dataset_id
					: undefined,
		};
	};

	const getModelLabel = (
		model: SelectedModel | null,
		modelNumber?: number,
	) => {
		if (!model) return "";

		const baseLabel = modelNumber ? `Model ${modelNumber}` : "Model";
		const modelInfo =
			model.type === "base"
				? model.modelId
				: `${model.job?.job_name || model.job?.job_id}`;

		return `${baseLabel} (${modelInfo})`;
	};

	// Helper functions for shared dataset management
	const fetchSharedDataset = async () => {
		if (!sharedDataset) return;

		setSharedDatasetLoading(true);
		setSharedDatasetError(null);
		try {
			const res = await fetch(
				`/api/datasets/${encodeURIComponent(sharedDataset)}`,
			);
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || "Failed to fetch dataset");

			const detailData = data as DatasetDetail;
			setSharedDatasetDetail(detailData);
			setSharedSplits(detailData.splits);
			if (detailData.splits.length > 0) {
				const first = detailData.splits[0];
				setSharedSelectedSplit(first.split_name);
				const languageModelingSamples = first.samples.filter(
					sample => sample.messages,
				);
				setSharedSamples(languageModelingSamples.slice(0, 5));
				setSharedSelected([]);
			}
		} catch (err: unknown) {
			setSharedDatasetError(
				err instanceof Error ? err.message : String(err),
			);
		} finally {
			setSharedDatasetLoading(false);
		}
	};

	const handleSharedSplitChange = (splitName: string) => {
		setSharedSelectedSplit(splitName);
		const split = sharedSplits.find(s => s.split_name === splitName);
		const languageModelingSamples =
			split?.samples.filter(sample => sample.messages) || [];
		setSharedSamples(languageModelingSamples.slice(0, 5));
		setSharedSelected([]);
	};

	const toggleSharedSampleSelection = (sample: DatasetSample) => {
		const getSampleKey = (sample: DatasetSample): string => {
			try {
				return JSON.stringify(
					sample.messages || sample.prompt || sample,
				);
			} catch {
				return String(Math.random());
			}
		};

		setSharedSelected(prev => {
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
	};

	const canProceedToStep2 = comparisonModels.isComparison
		? comparisonModels.model1 !== null && comparisonModels.model2 !== null
		: selectedModel !== null;
	const canProceedToStep3 = selectedMode !== null;

	const handleNext = async () => {
		if (step === 1 && canProceedToStep2) {
			// Helper function to validate and fetch job details
			const fetchJobDetails = async (model: SelectedModel) => {
				if (model.type === "trained" && model.job?.job_id) {
					const res = await fetch(`/api/jobs/${model.job.job_id}`);
					if (res.ok) {
						const jobDetails = await res.json();
						// Check if adapter_path exists for trained models
						if (!jobDetails.adapter_path) {
							throw new Error(
								`Training job ${model.job.job_name || model.job.job_id} is missing adapter path`,
							);
						}
						return jobDetails;
					}
					throw new Error(
						`Failed to fetch details for job ${model.job.job_id}`,
					);
				}
				return null;
			};

			setFetchingDetails(true);
			try {
				if (comparisonModels.isComparison) {
					// Handle comparison mode - validate both models
					const model1Details = comparisonModels.model1
						? await fetchJobDetails(comparisonModels.model1)
						: null;
					const model2Details = comparisonModels.model2
						? await fetchJobDetails(comparisonModels.model2)
						: null;

					// Store detailed job info for both models
					if (model1Details) {
						setDetailedJob1(model1Details);
					}
					if (model2Details) {
						setDetailedJob2(model2Details);
					}

					// For backward compatibility, still set detailedJob to model1's details
					if (model1Details) {
						setDetailedJob(model1Details);
					}
				} else {
					// Handle single model mode
					if (
						selectedModel?.type === "trained" &&
						selectedModel.job?.job_id
					) {
						const jobDetails = await fetchJobDetails(selectedModel);
						if (jobDetails) {
							setDetailedJob(jobDetails);
							console.log("Fetched detailed job:", jobDetails);
						}
					}
				}
			} catch (error) {
				console.error("Error fetching job details:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "Error fetching job details",
				);
				setFetchingDetails(false);
				return;
			} finally {
				setFetchingDetails(false);
			}

			setStep(2);
		} else if (step === 2 && canProceedToStep3) {
			// Prefill dataset when going to step 3
			prefillSharedDataset();
			setStep(3);
		}
	};

	const handleBack = () => {
		if (step > 1) {
			setStep(prev => (prev - 1) as 1 | 2);
		} else {
			router.push("/dashboard");
		}
	};

	const steps = [
		{
			number: 1,
			title: comparisonModels.isComparison
				? "Select Models"
				: "Select Model",
			completed: comparisonModels.isComparison
				? comparisonModels.model1 !== null &&
					comparisonModels.model2 !== null
				: selectedModel !== null,
		},
		{ number: 2, title: "Select Mode", completed: selectedMode !== null },
		{ number: 3, title: "Run Evaluation", completed: false },
	];

	return (
		<div className="max-w-6xl mx-auto py-8 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold">Model Evaluation</h1>
					<p className="text-muted-foreground">
						Evaluate model performance using metrics or batch
						inference
					</p>
				</div>
				<Button variant="outline" onClick={handleBack}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					{step === 1 ? "Back to Dashboard" : "Back"}
				</Button>
			</div>

			{/* Progress Steps */}
			<div className="flex items-center space-x-4 py-4">
				{steps.map((stepInfo, index) => (
					<div key={stepInfo.number} className="flex items-center">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
								step === stepInfo.number
									? "bg-primary text-primary-foreground"
									: stepInfo.completed
										? "bg-green-100 text-green-600"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{stepInfo.completed ? (
								<CheckCircle2 className="w-5 h-5" />
							) : (
								stepInfo.number
							)}
						</div>
						<span
							className={`ml-2 text-sm ${
								step === stepInfo.number
									? "font-medium text-foreground"
									: stepInfo.completed
										? "text-green-600"
										: "text-muted-foreground"
							}`}
						>
							{stepInfo.title}
						</span>
						{index < steps.length - 1 && (
							<div className="w-12 h-px bg-border mx-4" />
						)}
					</div>
				))}
			</div>

			{/* Step Content */}
			<div className="space-y-6">
				{step === 1 && (
					<>
						<ModelSelector
							selectedModel={selectedModel}
							onModelSelect={setSelectedModel}
							comparisonModels={comparisonModels}
							onComparisonChange={setComparisonModels}
						/>
						<div className="flex justify-end">
							<Button
								onClick={handleNext}
								disabled={!canProceedToStep2 || fetchingDetails}
							>
								{fetchingDetails ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Loading details...
									</>
								) : (
									"Next: Select Mode"
								)}
							</Button>
						</div>
					</>
				)}

				{step === 2 && (
					<>
						<EvaluationModeSelector
							selectedMode={selectedMode}
							onModeSelect={setSelectedMode}
						/>
						<div className="flex justify-between">
							<Button variant="outline" onClick={handleBack}>
								Back
							</Button>
							<Button
								onClick={handleNext}
								disabled={!canProceedToStep3}
							>
								Next: Configure Evaluation
							</Button>
						</div>
					</>
				)}

				{step === 3 &&
					((selectedModel && selectedMode) ||
						(comparisonModels.isComparison &&
							comparisonModels.model1 &&
							comparisonModels.model2 &&
							selectedMode)) && (
						<>
							{/* Model Summary */}
							<div className="bg-muted/50 rounded-lg p-4">
								<div className="text-sm font-medium mb-2">
									Selected Configuration:
								</div>
								<div className="space-y-1 text-sm">
									{comparisonModels.isComparison ? (
										<>
											<div>
												<span className="font-medium">
													Mode:
												</span>{" "}
												Model Comparison
											</div>
											<div>
												<span className="font-medium">
													Model 1:
												</span>{" "}
												{comparisonModels.model1
													?.type === "base"
													? comparisonModels.model1
															.modelId
													: `Training Job: ${comparisonModels.model1?.job?.job_id}`}
											</div>
											<div>
												<span className="font-medium">
													Model 2:
												</span>{" "}
												{comparisonModels.model2
													?.type === "base"
													? comparisonModels.model2
															.modelId
													: `Training Job: ${comparisonModels.model2?.job?.job_id}`}
											</div>
										</>
									) : (
										<div>
											<span className="font-medium">
												Model:
											</span>{" "}
											{selectedModel?.type === "base"
												? selectedModel.modelId
												: `Training Job: ${selectedModel?.job?.job_id}`}
										</div>
									)}
									<div>
										<span className="font-medium">
											Evaluation Mode:
										</span>{" "}
										{selectedMode === "metrics"
											? "Metric-Based Evaluation"
											: "Vibe Check (Batch Inference)"}
									</div>
									{detailedJob &&
										!comparisonModels.isComparison && (
											<>
												<div>
													<span className="font-medium">
														Dataset:
													</span>{" "}
													{detailedJob.processed_dataset_id ||
														"N/A"}
												</div>
												<div>
													<span className="font-medium">
														Adapter:
													</span>{" "}
													{detailedJob.adapter_path
														? "Available"
														: "Not found"}
												</div>
											</>
										)}
								</div>
							</div>

							{/* Evaluation Component */}
							{comparisonModels.isComparison ? (
								// Comparison Mode - Side by side evaluation
								<div className="space-y-6">
									<div className="text-lg font-semibold text-center">
										Model Comparison -{" "}
										{selectedMode === "metrics"
											? "Metrics"
											: "Batch Inference"}
									</div>

									{/* Shared Dataset Selection for Comparison Mode */}
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Dataset Selection
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												{selectedMode ===
												"batch_inference"
													? "Select the same dataset and samples for both models to ensure fair comparison"
													: "Select the dataset for evaluation (same dataset will be used for both models)"}
											</p>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex gap-2">
												<div className="flex-1">
													<Label
														htmlFor="shared-dataset"
														className="font-semibold"
													>
														Dataset Name
													</Label>
													<Input
														id="shared-dataset"
														value={sharedDataset}
														onChange={e =>
															setSharedDataset(
																e.target.value,
															)
														}
														placeholder="Enter dataset name..."
														disabled={
															sharedDatasetLoading
														}
														className="mt-1"
													/>
												</div>
												<Button
													onClick={fetchSharedDataset}
													disabled={
														!sharedDataset ||
														sharedDatasetLoading
													}
													className="mt-6"
												>
													{sharedDatasetLoading ? (
														<Loader2 className="animate-spin w-4 h-4" />
													) : (
														"Load Dataset"
													)}
												</Button>
											</div>

											{sharedDatasetError && (
												<div className="text-red-600 text-sm">
													{sharedDatasetError}
												</div>
											)}

											{sharedSplits.length > 0 && (
												<div className="flex items-center gap-2">
													<Label
														htmlFor="shared-split"
														className="font-semibold"
													>
														Split:
													</Label>
													<select
														id="shared-split"
														value={
															sharedSelectedSplit
														}
														onChange={e =>
															handleSharedSplitChange(
																e.target.value,
															)
														}
														className="border rounded p-2"
													>
														{sharedSplits.map(
															(
																s: DatasetSplit,
															) => (
																<option
																	key={
																		s.split_name
																	}
																	value={
																		s.split_name
																	}
																>
																	{
																		s.split_name
																	}
																</option>
															),
														)}
													</select>
												</div>
											)}

											{/* Sample Selection for Batch Inference */}
											{selectedMode ===
												"batch_inference" &&
												sharedSamples.length > 0 && (
													<div className="space-y-3">
														<div className="font-semibold text-sm">
															Select samples for
															both models (max 5)
														</div>
														<div className="space-y-3 max-h-96 overflow-y-auto">
															{sharedSamples.map(
																(
																	sample: DatasetSample,
																	idx: number,
																) => {
																	const getInferenceMessages =
																		(
																			messages: DatasetMessage[],
																		) =>
																			messages.filter(
																				m =>
																					m.role !==
																					"assistant",
																			);
																	const sampleKey =
																		JSON.stringify(
																			sample.messages ||
																				sample.prompt ||
																				sample,
																		) + idx;

																	return (
																		<label
																			key={
																				sampleKey
																			}
																			className="flex items-start gap-3 p-3 border rounded hover:bg-muted/50 cursor-pointer"
																		>
																			<input
																				type="checkbox"
																				checked={sharedSelected.some(
																					s =>
																						JSON.stringify(
																							s.messages ||
																								s.prompt ||
																								s,
																						) ===
																						JSON.stringify(
																							sample.messages ||
																								sample.prompt ||
																								sample,
																						),
																				)}
																				onChange={() =>
																					toggleSharedSampleSelection(
																						sample,
																					)
																				}
																				className="mt-1"
																			/>
																			<div className="flex-1 min-w-0 space-y-2">
																				<div className="text-sm font-medium text-muted-foreground">
																					Sample{" "}
																					{idx +
																						1}
																				</div>
																				{sample.messages ? (
																					<div className="text-sm">
																						{getInferenceMessages(
																							sample.messages,
																						).map(
																							(
																								msg: DatasetMessage,
																								msgIdx: number,
																							) => (
																								<div
																									key={`${sampleKey}-msg-${msgIdx}-${msg.role}`}
																									className="mb-2"
																								>
																									<div className="font-medium text-xs text-muted-foreground uppercase mb-1">
																										{
																											msg.role
																										}
																										:
																									</div>
																									<div className="bg-muted/30 p-2 rounded">
																										{typeof msg.content ===
																										"string"
																											? msg.content
																											: Array.isArray(
																														msg.content,
																													)
																												? msg.content
																														.map(
																															(
																																c: {
																																	type: string;
																																	text?: string;
																																},
																																contentIdx: number,
																															) =>
																																c.type ===
																																"text"
																																	? c.text
																																	: `[${c.type}]`,
																														)
																														.join(
																															"",
																														)
																												: "[Complex content]"}
																									</div>
																								</div>
																							),
																						)}
																					</div>
																				) : sample.prompt ? (
																					<div className="text-sm">
																						<div className="font-medium text-xs text-muted-foreground uppercase mb-1">
																							PROMPT:
																						</div>
																						<div className="bg-muted/30 p-2 rounded">
																							{Array.isArray(
																								sample.prompt,
																							)
																								? sample.prompt
																										.map(
																											(
																												p: DatasetMessage,
																												promptIdx: number,
																											) =>
																												typeof p.content ===
																												"string"
																													? p.content
																													: Array.isArray(
																																p.content,
																															)
																														? p.content
																																.map(
																																	(c: {
																																		type: string;
																																		text?: string;
																																	}) =>
																																		c.type ===
																																		"text"
																																			? c.text
																																			: `[${c.type}]`,
																																)
																																.join(
																																	"",
																																)
																														: "[complex content]",
																										)
																										.join(
																											" ",
																										)
																								: "Invalid prompt format"}
																						</div>
																					</div>
																				) : (
																					<div className="text-sm text-muted-foreground">
																						No
																						content
																						available
																					</div>
																				)}
																			</div>
																		</label>
																	);
																},
															)}
														</div>
													</div>
												)}

											{selectedMode ===
												"batch_inference" &&
												sharedSplits.length > 0 &&
												sharedSamples.length === 0 && (
													<div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
														<p className="font-medium text-yellow-800">
															No samples available
															for batch inference
														</p>
														<p className="text-yellow-700 mt-1">
															This dataset appears
															to be in prompt-only
															format. Batch
															inference requires
															datasets in language
															modeling format with
															complete
															conversations.
														</p>
													</div>
												)}
										</CardContent>
									</Card>

									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										{/* Model 1 */}
										<div className="space-y-4">
											<h3 className="font-medium text-sm text-muted-foreground text-center">
												Model 1 -{" "}
												{comparisonModels.model1
													?.type === "base"
													? comparisonModels.model1
															.modelId
													: `Job ${comparisonModels.model1?.job?.job_id}`}
											</h3>
											{selectedMode ===
											"batch_inference" ? (
												<Card>
													<CardHeader>
														<CardTitle className="text-base">
															Batch Inference
														</CardTitle>
													</CardHeader>
													<CardContent>
														<BatchInferenceForm
															{...getModelConfig(
																comparisonModels.model1,
																detailedJob1,
															)}
															isComparison={true}
															modelLabel={getModelLabel(
																comparisonModels.model1,
																1,
															)}
															preSelectedSamples={
																sharedSelected
															}
															sharedDatasetId={
																sharedDataset
															}
														/>
													</CardContent>
												</Card>
											) : (
												<Card>
													<CardHeader>
														<CardTitle className="text-base">
															Metrics Evaluation
														</CardTitle>
													</CardHeader>
													<CardContent>
														<EvaluationForm
															{...getModelConfig(
																comparisonModels.model1,
																detailedJob1,
															)}
															isComparison={true}
															modelLabel={getModelLabel(
																comparisonModels.model1,
																1,
															)}
															sharedDatasetId={
																sharedDataset
															}
														/>
													</CardContent>
												</Card>
											)}
										</div>

										{/* Model 2 */}
										<div className="space-y-4">
											<h3 className="font-medium text-sm text-muted-foreground text-center">
												Model 2 -{" "}
												{comparisonModels.model2
													?.type === "base"
													? comparisonModels.model2
															.modelId
													: `Job ${comparisonModels.model2?.job?.job_id}`}
											</h3>
											{selectedMode ===
											"batch_inference" ? (
												<Card>
													<CardHeader>
														<CardTitle className="text-base">
															Batch Inference
														</CardTitle>
													</CardHeader>
													<CardContent>
														<BatchInferenceForm
															{...getModelConfig(
																comparisonModels.model2,
																detailedJob2,
															)}
															isComparison={true}
															modelLabel={getModelLabel(
																comparisonModels.model2,
																2,
															)}
															preSelectedSamples={
																sharedSelected
															}
															sharedDatasetId={
																sharedDataset
															}
														/>
													</CardContent>
												</Card>
											) : (
												<Card>
													<CardHeader>
														<CardTitle className="text-base">
															Metrics Evaluation
														</CardTitle>
													</CardHeader>
													<CardContent>
														<EvaluationForm
															{...getModelConfig(
																comparisonModels.model2,
																detailedJob2,
															)}
															isComparison={true}
															modelLabel={getModelLabel(
																comparisonModels.model2,
																2,
															)}
															sharedDatasetId={
																sharedDataset
															}
														/>
													</CardContent>
												</Card>
											)}
										</div>
									</div>
								</div>
							) : // Single Model Mode
							selectedMode === "batch_inference" ? (
								<Card>
									<CardHeader>
										<CardTitle>
											Batch Inference Configuration
										</CardTitle>
									</CardHeader>
									<CardContent>
										<BatchInferenceForm
											{...getModelConfig(
												selectedModel,
												detailedJob,
											)}
										/>
									</CardContent>
								</Card>
							) : (
								<Card>
									<CardHeader>
										<CardTitle>
											Metrics Evaluation Configuration
										</CardTitle>
									</CardHeader>
									<CardContent>
										<EvaluationForm
											{...getModelConfig(
												selectedModel,
												detailedJob,
											)}
										/>
									</CardContent>
								</Card>
							)}

							<div className="flex justify-start">
								<Button variant="outline" onClick={handleBack}>
									Back
								</Button>
							</div>
						</>
					)}
			</div>
		</div>
	);
}
