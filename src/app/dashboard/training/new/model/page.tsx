"use client";

import { trainingModelAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
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
		<RadioCardGroup
			className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
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
					<div className="flex flex-col gap-8">
						<span className="font-semibold">{model}</span>
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
