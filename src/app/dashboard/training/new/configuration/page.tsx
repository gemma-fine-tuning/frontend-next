"use client";

import {
	trainingConfigAtom,
	trainingDatasetIdAtom,
	trainingJobNameAtom,
	trainingModelAtom,
} from "@/atoms";
import type { TrainingConfigType } from "@/atoms";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function TrainingConfigPage() {
	const [config, setConfig] = useAtom(trainingConfigAtom);
	const [model] = useAtom(trainingModelAtom);
	const [datasetId] = useAtom(trainingDatasetIdAtom);
	const [jobName, setJobName] = useAtom(trainingJobNameAtom);
	const router = useRouter();

	useEffect(() => {
		if (!model) {
			toast.error("Please select a model first.");
			router.replace("/dashboard/training/new/model");
		} else if (!datasetId) {
			toast.error("Please select a dataset first.");
			router.replace("/dashboard/training/new/dataset");
		}
	}, [model, datasetId, router]);
	if (!model || !datasetId) return null;

	// Initialise config if null
	if (!config) {
		setConfig({
			method: "QLoRA",
			base_model_id: model?.modelId ?? "",
			lora_rank: 16,
			lora_alpha: 16,
			lora_dropout: 0.05,
			learning_rate: 2e-4,
			batch_size: 4,
			epochs: 3,
			max_steps: -1,
			gradient_accumulation_steps: 4,
			packing: false,
			use_fa2: false,
			provider: model?.provider ?? "huggingface",
			modality: "text",
			lr_scheduler_type: "linear",
			save_strategy: "epoch",
			logging_steps: 10,
			eval_strategy: "no",
			eval_steps: 50,
			compute_eval_metrics: false,
			batch_eval_metrics: false,
			export_format: "adapter",
			export_destination: "gcs",
			hf_repo_id: "",
			include_gguf: false,
			gguf_quantization: "none",
			wandb_api_key: "",
			wandb_project: "",
			wandb_log_model: "end",
		});
		return null; // render after state set
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		let processedValue: unknown = value;

		if (type === "checkbox") {
			processedValue = (e.target as HTMLInputElement).checked;
		} else if (type === "number") {
			processedValue = Number.parseFloat(value) || 0;
		}

		setConfig(prev => (prev ? { ...prev, [name]: processedValue } : null));
	};

	const handleNext = () => {
		router.push("/dashboard/training/new/review");
	};

	const NumberInput = ({
		field,
		label,
		step = 1,
	}: { field: keyof TrainingConfigType; label: string; step?: number }) => (
		<div className="space-y-1">
			<Label htmlFor={field}>{label}</Label>
			<Input
				id={field}
				name={field}
				type="number"
				step={step}
				value={String(config?.[field] ?? "")}
				onChange={handleChange}
			/>
		</div>
	);

	const SelectInput = ({
		field,
		label,
		options,
	}: {
		field: keyof TrainingConfigType;
		label: string;
		options: { value: string; label: string }[];
	}) => (
		<div className="space-y-1">
			<Label htmlFor={field}>{label}</Label>
			<select
				id={field}
				name={field}
				value={String(config?.[field] ?? "")}
				onChange={handleChange}
				className="w-full p-2 border rounded"
			>
				{options.map(option => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);

	const CheckboxInput = ({
		field,
		label,
	}: { field: keyof TrainingConfigType; label: string }) => (
		<div className="flex items-center space-x-2">
			<input
				id={field}
				name={field}
				type="checkbox"
				checked={Boolean(config?.[field])}
				onChange={handleChange}
			/>
			<Label htmlFor={field}>{label}</Label>
		</div>
	);

	return (
		<div className="max-w-3xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Training Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<Accordion type="single" collapsible defaultValue="basic">
						<AccordionItem value="basic">
							<AccordionTrigger>
								Basic Training Settings
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								<div className="space-y-1 md:col-span-2">
									<Label>Job Name</Label>
									<Input
										name="job_name"
										value={jobName}
										onChange={e =>
											setJobName(e.target.value)
										}
									/>
								</div>
								{SelectInput({
									field: "method",
									label: "Training Method",
									options: [
										{
											value: "Full",
											label: "Full Fine-tuning",
										},
										{ value: "LoRA", label: "LoRA" },
										{ value: "QLoRA", label: "QLoRA" },
										{
											value: "RL",
											label: "Reinforcement Learning",
										},
									],
								})}
								{SelectInput({
									field: "modality",
									label: "Training Modality",
									options: [
										{ value: "text", label: "Text" },
										{ value: "vision", label: "Vision" },
									],
								})}
								{NumberInput({
									field: "batch_size",
									label: "Batch Size",
								})}
								{NumberInput({
									field: "epochs",
									label: "Epochs",
								})}
								{NumberInput({
									field: "learning_rate",
									label: "Learning Rate",
									step: 0.00001,
								})}
								{NumberInput({
									field: "gradient_accumulation_steps",
									label: "Gradient Accumulation Steps",
								})}
								{NumberInput({
									field: "max_steps",
									label: "Max Steps (-1 for no limit)",
								})}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="lora">
							<AccordionTrigger>LoRA Settings</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{NumberInput({
									field: "lora_rank",
									label: "LoRA Rank",
								})}
								{NumberInput({
									field: "lora_alpha",
									label: "LoRA Alpha",
								})}
								{NumberInput({
									field: "lora_dropout",
									label: "LoRA Dropout",
									step: 0.01,
								})}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="evaluation">
							<AccordionTrigger>
								Evaluation Settings
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{SelectInput({
									field: "eval_strategy",
									label: "Evaluation Strategy",
									options: [
										{ value: "no", label: "No Evaluation" },
										{
											value: "steps",
											label: "Evaluate Every N Steps",
										},
										{
											value: "epoch",
											label: "Evaluate Every Epoch",
										},
									],
								})}
								{NumberInput({
									field: "eval_steps",
									label: "Evaluation Steps",
								})}
								{CheckboxInput({
									field: "compute_eval_metrics",
									label: "Compute Eval Metrics (accuracy, perplexity)",
								})}
								{CheckboxInput({
									field: "batch_eval_metrics",
									label: "Enable Batch Eval Mode",
								})}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="advanced">
							<AccordionTrigger>
								Advanced Settings
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{NumberInput({
									field: "max_seq_length",
									label: "Max Sequence Length",
								})}
								{SelectInput({
									field: "lr_scheduler_type",
									label: "Learning Rate Scheduler",
									options: [
										{ value: "linear", label: "Linear" },
										{ value: "cosine", label: "Cosine" },
										{
											value: "polynomial",
											label: "Polynomial",
										},
										{
											value: "constant",
											label: "Constant",
										},
									],
								})}
								{SelectInput({
									field: "save_strategy",
									label: "Save Strategy",
									options: [
										{
											value: "epoch",
											label: "Save Every Epoch",
										},
										{
											value: "steps",
											label: "Save Every N Steps",
										},
										{ value: "no", label: "No Saving" },
									],
								})}
								{NumberInput({
									field: "logging_steps",
									label: "Logging Steps",
								})}
								{CheckboxInput({
									field: "packing",
									label: "Enable Sequence Packing",
								})}
								{CheckboxInput({
									field: "use_fa2",
									label: "Use Flash Attention 2 (HuggingFace only)",
								})}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="export">
							<AccordionTrigger>
								Export Configuration
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								{SelectInput({
									field: "export_format",
									label: "Export Format",
									options: [
										{
											value: "adapter",
											label: "Adapter Only",
										},
										{
											value: "merged",
											label: "Merged Model",
										},
									],
								})}
								{SelectInput({
									field: "export_destination",
									label: "Export Destination",
									options: [
										{
											value: "gcs",
											label: "Google Cloud Storage",
										},
										{
											value: "hfhub",
											label: "Hugging Face Hub",
										},
									],
								})}
								{CheckboxInput({
									field: "include_gguf",
									label: "Include GGUF Export",
								})}
								{SelectInput({
									field: "gguf_quantization",
									label: "GGUF Quantization (if enabled)",
									options: [
										{
											value: "none",
											label: "No Quantization",
										},
										{
											value: "f16",
											label: "FP16 (Half Precision)",
										},
										{
											value: "bf16",
											label: "BF16 (Brain Float 16)",
										},
										{
											value: "q8_0",
											label: "Q8_0 (8-bit)",
										},
										{
											value: "q4_k_m",
											label: "Q4_K_M (4-bit)",
										},
									],
								})}
								<div className="space-y-1 md:col-span-2">
									<Label>
										HuggingFace Repo ID (for HF Hub export)
									</Label>
									<Input
										name="hf_repo_id"
										value={config?.hf_repo_id ?? ""}
										onChange={handleChange}
									/>
								</div>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="wandb">
							<AccordionTrigger>
								Weights & Biases
							</AccordionTrigger>
							<AccordionContent className="grid md:grid-cols-2 gap-4 py-4">
								<div className="space-y-1 md:col-span-2">
									<Label>WandB API Key</Label>
									<Input
										name="wandb_api_key"
										type="password"
										value={config?.wandb_api_key ?? ""}
										onChange={handleChange}
									/>
								</div>
								<div className="space-y-1">
									<Label>WandB Project</Label>
									<Input
										name="wandb_project"
										value={config?.wandb_project ?? ""}
										onChange={handleChange}
									/>
								</div>
								{SelectInput({
									field: "wandb_log_model",
									label: "Log Model to WandB",
									options: [
										{
											value: "false",
											label: "Don't Log Model",
										},
										{
											value: "checkpoint",
											label: "Log Checkpoints",
										},
										{
											value: "end",
											label: "Log Final Model",
										},
									],
								})}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
				<CardFooter>
					<Button
						onClick={handleNext}
						className="w-full md:w-auto md:ml-auto"
					>
						Next
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
