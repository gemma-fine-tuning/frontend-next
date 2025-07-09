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
			lora_rank: 4,
			lora_alpha: 16,
			lora_dropout: 0.05,
			learning_rate: 2e-4,
			batch_size: 2,
			epochs: 1,
			max_steps: 100,
			max_seq_length: 1024,
			gradient_accumulation_steps: 4,
			provider: model?.provider ?? "huggingface",
			export: "hfhub",
			hf_repo_id: "",
			wandb_api_key: "",
			wandb_project: "",
		});
		return null; // render after state set
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setConfig(prev => (prev ? { ...prev, [name]: value } : null));
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
				value={config?.[field] ?? ""}
				onChange={handleChange}
			/>
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
							<AccordionTrigger>Basic</AccordionTrigger>
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
								<div className="space-y-1">
									<Label>Method</Label>
									<Input
										name="method"
										value={config?.method ?? ""}
										onChange={handleChange}
									/>
								</div>
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
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="advanced">
							<AccordionTrigger>Advanced</AccordionTrigger>
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
								{NumberInput({
									field: "max_steps",
									label: "Max Steps",
								})}
								{NumberInput({
									field: "max_seq_length",
									label: "Max Seq Length",
								})}
								{NumberInput({
									field: "gradient_accumulation_steps",
									label: "Grad Accum Steps",
								})}
								<div className="space-y-1 md:col-span-2">
									<Label>HF Repo ID</Label>
									<Input
										name="hf_repo_id"
										value={config?.hf_repo_id ?? ""}
										onChange={handleChange}
									/>
								</div>
								<div className="space-y-1 md:col-span-2">
									<Label>WandB API Key</Label>
									<Input
										name="wandb_api_key"
										value={config?.wandb_api_key ?? ""}
										onChange={handleChange}
									/>
								</div>
								<div className="space-y-1 md:col-span-2">
									<Label>WandB Project</Label>
									<Input
										name="wandb_project"
										value={config?.wandb_project ?? ""}
										onChange={handleChange}
									/>
								</div>
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
