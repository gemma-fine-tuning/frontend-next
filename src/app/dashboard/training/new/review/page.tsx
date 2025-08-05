"use client";

import {
	trainingConfigAtom,
	trainingDatasetIdAtom,
	trainingDatasetModalityAtom,
	trainingJobNameAtom,
	trainingModelAtom,
} from "@/atoms";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAtom } from "jotai";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TrainingReviewPage() {
	const [model] = useAtom(trainingModelAtom);
	const [datasetId] = useAtom(trainingDatasetIdAtom);
	const [modality] = useAtom(trainingDatasetModalityAtom);
	const [config] = useAtom(trainingConfigAtom);
	const [jobName] = useAtom(trainingJobNameAtom);
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!model) {
			toast.error("Please select a model first.");
			router.replace("/dashboard/training/new/model");
		} else if (!datasetId) {
			toast.error("Please select a dataset first.");
			router.replace("/dashboard/training/new/dataset");
		} else if (!config) {
			toast.error("Please complete configuration first.");
			router.replace("/dashboard/training/new/configuration");
		}
	}, [model, datasetId, config, router]);
	if (!model || !datasetId || !config) return null;

	const exportDestination = config.export_destination || "gcs";

	const handleSubmit = async () => {
		setSubmitting(true);
		setError(null);
		try {
			const payload = {
				processed_dataset_id: datasetId,
				job_name: jobName,
				hf_token: config.hf_token || "",
				training_config: {
					method: config.method,
					base_model_id: model.modelId,
					lora_rank: config.lora_rank,
					lora_alpha: config.lora_alpha,
					lora_dropout: config.lora_dropout,
					learning_rate: config.learning_rate,
					batch_size: config.batch_size,
					gradient_accumulation_steps:
						config.gradient_accumulation_steps,
					epochs: config.epochs,
					max_steps: config.max_steps,
					packing: config.packing,
					use_fa2: config.use_fa2,
					provider: model.provider,
					modality: config.modality,
					max_seq_length: config.max_seq_length,
					lr_scheduler_type: config.lr_scheduler_type,
					save_strategy: config.save_strategy,
					logging_steps: config.logging_steps,
					eval_strategy: config.eval_strategy,
					eval_steps: config.eval_steps,
					compute_eval_metrics: config.compute_eval_metrics,
					batch_eval_metrics: config.batch_eval_metrics,
				},
				export_config: {
					format: config.export_format || "adapter",
					quantization: config.export_quantization || "q4",
					destination: exportDestination,
					hf_repo_id: config.hf_repo_id,
				},
				wandb_config: config.wandb_api_key
					? {
							api_key: config.wandb_api_key,
							project: config.wandb_project,
							log_model: config.wandb_log_model,
						}
					: undefined,
			};
			const res = await fetch("/api/jobs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Failed to submit job");
			router.push("/dashboard/training");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setSubmitting(false);
		}
	};

	const SummaryRow = ({
		label,
		value,
		editLink,
	}: {
		label: string;
		value: React.ReactNode;
		editLink: string;
	}) => (
		<div className="flex items-start justify-between gap-2 border-b last:border-b-0 py-3">
			<div>
				<span className="font-medium">{label}:</span> {value}
			</div>
			<Link
				href={editLink}
				className="text-muted-foreground hover:text-foreground"
			>
				<Pencil size={16} />
			</Link>
		</div>
	);

	return (
		<div className="max-w-2xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Review & Submit</CardTitle>
					<CardDescription className="text-muted-foreground">
						Please review your selections before starting the
						training job.
					</CardDescription>
				</CardHeader>
				<CardContent className="divide-y">
					{SummaryRow({
						label: "Model",
						value: model.modelId,
						editLink: "/dashboard/training/new/model",
					})}
					{SummaryRow({
						label: "Provider",
						value: model.provider,
						editLink: "/dashboard/training/new/model",
					})}
					{SummaryRow({
						label: "Job Name",
						value: jobName || "-",
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Modality",
						value: config.modality || "text",
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Dataset",
						value: datasetId,
						editLink: "/dashboard/training/new/dataset",
					})}
					{SummaryRow({
						label: "Method",
						value: config.method,
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Export Destination",
						value: exportDestination,
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Export Format",
						value: config.export_format || "adapter",
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Batch Size",
						value: String(config.batch_size),
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Epochs",
						value: String(config.epochs),
						editLink: "/dashboard/training/new/configuration",
					})}
					{SummaryRow({
						label: "Learning Rate",
						value: String(config.learning_rate),
						editLink: "/dashboard/training/new/configuration",
					})}
					{config.eval_strategy &&
						config.eval_strategy !== "no" &&
						SummaryRow({
							label: "Evaluation Strategy",
							value: config.eval_strategy,
							editLink: "/dashboard/training/new/configuration",
						})}
					{config.compute_eval_metrics &&
						SummaryRow({
							label: "Compute Evaluation Metrics",
							value: "Yes (accuracy, perplexity)",
							editLink: "/dashboard/training/new/configuration",
						})}
					{/* Add more key fields if needed */}
				</CardContent>
				{error && (
					<p className="text-destructive text-sm px-6 py-2">
						{error}
					</p>
				)}
				<CardFooter className="flex flex-col md:flex-row gap-4 justify-end">
					<Button variant="outline" asChild disabled={submitting}>
						<Link href="/dashboard/training/new/configuration">
							Back
						</Link>
					</Button>
					<Button onClick={handleSubmit} disabled={submitting}>
						{submitting ? "Submitting..." : "Submit Training Job"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
