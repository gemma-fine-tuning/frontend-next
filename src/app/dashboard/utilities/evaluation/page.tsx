"use client";

import BatchInferenceForm from "@/components/batch-inference-form";
import EvaluationForm from "@/components/evaluation-form";
import EvaluationModeSelector, {
	type EvaluationMode,
} from "@/components/evaluation-mode-selector";
import ModelSelector, { type SelectedModel } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	const [selectedMode, setSelectedMode] = useState<EvaluationMode | null>(
		null,
	);
	const [detailedJob, setDetailedJob] = useState<TrainingJob | null>(null);
	const [fetchingDetails, setFetchingDetails] = useState(false);

	const canProceedToStep2 = selectedModel !== null;
	const canProceedToStep3 = selectedMode !== null;

	const handleNext = async () => {
		if (step === 1 && canProceedToStep2) {
			// If we have a trained model, fetch detailed job information
			if (
				selectedModel?.type === "trained" &&
				selectedModel.job?.job_id
			) {
				setFetchingDetails(true);
				try {
					const res = await fetch(
						`/api/jobs/${selectedModel.job.job_id}`,
					);
					if (res.ok) {
						const jobDetails = await res.json();

						// Check if adapter_path exists for trained models
						if (!jobDetails.adapter_path) {
							toast.error(
								"Training job is missing adapter path",
								{
									description:
										"This training job cannot be used for evaluation because it doesn't have a trained adapter.",
								},
							);
							setFetchingDetails(false);
							return;
						}

						setDetailedJob(jobDetails);
						console.log("Fetched detailed job:", jobDetails);
					} else {
						console.error("Failed to fetch job details");
						toast.error("Failed to fetch job details");
						setFetchingDetails(false);
						return;
					}
				} catch (error) {
					console.error("Error fetching job details:", error);
					toast.error("Error fetching job details");
					setFetchingDetails(false);
					return;
				} finally {
					setFetchingDetails(false);
				}
			}
			setStep(2);
		} else if (step === 2 && canProceedToStep3) {
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
		{ number: 1, title: "Select Model", completed: selectedModel !== null },
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

				{step === 3 && selectedModel && selectedMode && (
					<>
						{/* Model Summary */}
						<div className="bg-muted/50 rounded-lg p-4">
							<div className="text-sm font-medium mb-2">
								Selected Configuration:
							</div>
							<div className="space-y-1 text-sm">
								<div>
									<span className="font-medium">Model:</span>{" "}
									{selectedModel.type === "base"
										? selectedModel.modelId
										: `Training Job: ${selectedModel.job?.job_id}`}
								</div>
								<div>
									<span className="font-medium">Mode:</span>{" "}
									{selectedMode === "metrics"
										? "Metric-Based Evaluation"
										: "Vibe Check (Batch Inference)"}
								</div>
								{detailedJob && (
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
						{selectedMode === "batch_inference" ? (
							<Card>
								<CardHeader>
									<CardTitle>
										Batch Inference Configuration
									</CardTitle>
								</CardHeader>
								<CardContent>
									<BatchInferenceForm
										job={
											selectedModel.type === "trained"
												? detailedJob ||
													selectedModel.job
												: undefined
										}
										adapterPath={
											selectedModel.type === "base"
												? selectedModel.modelId
												: detailedJob?.adapter_path ||
													selectedModel.job
														?.adapter_path
										}
										baseModelId={
											selectedModel.type === "base"
												? selectedModel.modelId
												: detailedJob?.base_model_id ||
													selectedModel.job
														?.base_model_id
										}
										initialDatasetId={
											selectedModel.type === "trained"
												? detailedJob?.processed_dataset_id ||
													selectedModel.job
														?.processed_dataset_id
												: undefined
										}
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
										job={
											selectedModel.type === "trained"
												? detailedJob ||
													selectedModel.job
												: undefined
										}
										adapterPath={
											selectedModel.type === "base"
												? selectedModel.modelId
												: detailedJob?.adapter_path ||
													selectedModel.job
														?.adapter_path
										}
										baseModelId={
											selectedModel.type === "base"
												? selectedModel.modelId
												: detailedJob?.base_model_id ||
													selectedModel.job
														?.base_model_id
										}
										initialDatasetId={
											selectedModel.type === "trained"
												? detailedJob?.processed_dataset_id ||
													selectedModel.job
														?.processed_dataset_id
												: undefined
										}
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
