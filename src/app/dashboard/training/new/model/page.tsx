"use client";

import { trainingModelAtom } from "@/atoms";
import SelectionCard from "@/components/training-selection-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

const gemmaModels = [
	"google/gemma-3-1b-it",
	"google/gemma-3-4b-it",
	"google/gemma-3-12b-it",
	// "google/gemma-3-27b-it",
	"google/gemma-3n-E2B-it",
	"google/gemma-3n-E4B-it",
];
const unslothModels = [
	"unsloth/gemma-3-1b-it-unsloth-bnb-4bit",
	"unsloth/gemma-3-4b-it-unsloth-bnb-4bit",
	"unsloth/gemma-3-12b-it-unsloth-bnb-4bit",
	// "unsloth/gemma-3-27b-it-unsloth-bnb-4bit",
	"unsloth/gemma-3n-E4B-it-unsloth-bnb-4bit",
	"unsloth/gemma-3n-E2B-it-unsloth-bnb-4bit",
];

const providerLabel = {
	huggingface: "Hugging Face",
	unsloth: "Unsloth",
};

export default function ModelSelectionPage() {
	const [selected, setSelected] = useAtom(trainingModelAtom);
	const router = useRouter();

	const handleSelect = (
		modelId: string,
		provider: "unsloth" | "huggingface",
	) => {
		setSelected({ modelId, provider });
	};

	const handleNext = () => {
		if (!selected) return;
		router.push("/dashboard/training/new/dataset");
	};

	const renderGrid = (
		models: string[],
		provider: "unsloth" | "huggingface",
	) => (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
			{models.map(model => (
				<SelectionCard
					key={model}
					title={model}
					selected={selected?.modelId === model}
					onSelect={() => handleSelect(model, provider)}
				>
					<span className="text-xs text-muted-foreground capitalize">
						Provider: {providerLabel[provider]}
					</span>
				</SelectionCard>
			))}
		</div>
	);

	return (
		<div className="max-w-4xl mx-auto py-10 space-y-8">
			<Tabs defaultValue="gemma">
				<TabsList className="w-full mb-4">
					<TabsTrigger value="gemma" className="flex-1">
						Gemma (Hugging Face)
					</TabsTrigger>
					<TabsTrigger value="unsloth" className="flex-1">
						4-bit (Unsloth)
					</TabsTrigger>
				</TabsList>
				<TabsContent value="gemma">
					{renderGrid(gemmaModels, "huggingface")}
				</TabsContent>
				<TabsContent value="unsloth">
					{renderGrid(unslothModels, "unsloth")}
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
