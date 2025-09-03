"use client";

import { trainingModelAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type ModelProvider,
	gemmaModelsIT,
	gemmaModelsPT,
	providerLabel,
	unsloth4BitModelsIT,
	unsloth4BitModelsPT,
	unslothModelsIT,
	unslothModelsPT,
} from "@/lib/models";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

export default function ModelSelectionPage() {
	const [selected, setSelected] = useAtom(trainingModelAtom);
	const router = useRouter();

	const handleSelect = (modelId: string, provider: ModelProvider) => {
		setSelected({ modelId, provider });
	};

	const handleNext = () => {
		if (!selected) return;
		router.push("/dashboard/training/new/dataset");
	};

	const renderGrid = (models: string[], provider: ModelProvider) => (
		<RadioCardGroup
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
			onValueChange={value => {
				handleSelect(value, provider);
			}}
		>
			{models.map(model => (
				<RadioCardGroupItem
					key={model}
					value={model}
					className=""
					checked={selected?.modelId === model}
				>
					<div className="flex flex-col gap-4">
						<span className="font-semibold text-sm break-words">
							{model}
						</span>
						<span className="text-muted-foreground text-xs capitalize">
							Provider: {providerLabel[provider]}
						</span>
					</div>
				</RadioCardGroupItem>
			))}
		</RadioCardGroup>
	);

	return (
		<div className="max-w-4xl mx-auto py-10 space-y-8">
			<Tabs defaultValue="gemma">
				<TabsList className="w-full mb-4">
					<TabsTrigger value="gemma" className="flex-1">
						Gemma (Hugging Face)
					</TabsTrigger>
					<TabsTrigger value="unsloth" className="flex-1">
						Unsloth (Standard)
					</TabsTrigger>
					<TabsTrigger value="unsloth-4bit" className="flex-1">
						Unsloth (4-bit Quant)
					</TabsTrigger>
				</TabsList>
				<TabsContent value="gemma">
					<div className="space-y-2 mb-4">
						<h3 className="text-lg font-semibold">
							Google/Hugging Face Models
						</h3>
						<p className="text-sm text-muted-foreground">
							Base models from Google and Hugging Face. Choose
							between pre-trained (PT) and instruction-tuned (IT)
							variants.
						</p>
					</div>
					<div className="space-y-6">
						<div>
							<h4 className="text-md font-medium mb-3">
								Pre-trained (PT) Models
							</h4>
							<p className="text-xs text-muted-foreground mb-3">
								Base models for general fine-tuning. Good for
								custom training tasks.
							</p>
							{renderGrid(gemmaModelsPT, "huggingface")}
						</div>
						<div>
							<h4 className="text-md font-medium mb-3">
								Instruction-tuned (IT) Models
							</h4>
							<p className="text-xs text-muted-foreground mb-3">
								Already instruction-tuned models. Good for
								chat/conversation tasks.
							</p>
							{renderGrid(gemmaModelsIT, "huggingface")}
						</div>
					</div>
				</TabsContent>
				<TabsContent value="unsloth">
					<div className="space-y-2 mb-4">
						<h3 className="text-lg font-semibold">
							Unsloth Standard Models
						</h3>
						<p className="text-sm text-muted-foreground">
							Unsloth optimized models for faster training. Full
							precision versions.
						</p>
					</div>
					<div className="space-y-6">
						<div>
							<h4 className="text-md font-medium mb-3">
								Pre-trained (PT) Models
							</h4>
							<p className="text-xs text-muted-foreground mb-3">
								Unsloth optimized base models for custom
								fine-tuning.
							</p>
							{renderGrid(unslothModelsPT, "unsloth")}
						</div>
						<div>
							<h4 className="text-md font-medium mb-3">
								Instruction-tuned (IT) Models
							</h4>
							<p className="text-xs text-muted-foreground mb-3">
								Unsloth optimized instruction-tuned models for
								chat tasks.
							</p>
							{renderGrid(unslothModelsIT, "unsloth")}
						</div>
					</div>
				</TabsContent>
				<TabsContent value="unsloth-4bit">
					<div className="space-y-2 mb-4">
						<h3 className="text-lg font-semibold">
							Unsloth 4-bit Quantized Models
						</h3>
						<p className="text-sm text-muted-foreground">
							Dynamic 4-bit quantized models for memory-efficient
							training. Uses BitsAndBytes (BNB) quantization.
						</p>
					</div>
					<div className="space-y-6">
						<div>
							<h4 className="text-md font-medium mb-3">
								Pre-trained (PT) Models
							</h4>
							<p className="text-xs text-muted-foreground mb-3">
								4-bit quantized base models for memory-efficient
								custom training.
							</p>
							{renderGrid(unsloth4BitModelsPT, "unsloth")}
						</div>
						<div>
							<h4 className="text-md font-medium mb-3">
								Instruction-tuned (IT) Models
							</h4>
							<p className="text-xs text-muted-foreground mb-3">
								4-bit quantized instruction-tuned models for
								memory-efficient chat training.
							</p>
							{renderGrid(unsloth4BitModelsIT, "unsloth")}
						</div>
					</div>
				</TabsContent>
			</Tabs>

			<Button
				onClick={handleNext}
				disabled={!selected}
				className="w-full md:w-auto md:self-end"
			>
				Next
			</Button>
		</div>
	);
}
