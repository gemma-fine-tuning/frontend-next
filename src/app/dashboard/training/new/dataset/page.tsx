"use client";

import {
	trainingDatasetIdAtom,
	trainingDatasetModalityAtom,
	trainingModelAtom,
} from "@/atoms";
import { datasetsAtom, datasetsLoadingAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
import { useAtom } from "jotai";
import { FileTextIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function DatasetSelectionPage() {
	const [datasetId, setDatasetId] = useAtom(trainingDatasetIdAtom);
	const [_, setModality] = useAtom(trainingDatasetModalityAtom);
	const [model] = useAtom(trainingModelAtom);
	const [datasets] = useAtom(datasetsAtom);
	const [isLoading] = useAtom(datasetsLoadingAtom);
	const router = useRouter();

	useEffect(() => {
		if (!model) {
			toast.error("Please select a model first.");
			router.replace("/dashboard/training/new/model");
		}
	}, [model, router]);
	if (!model) return null;

	const handleNext = () => {
		if (!datasetId) return;
		router.push("/dashboard/training/new/configuration");
	};

	return (
		<div className="max-w-4xl mx-auto py-10 space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-1">Select Dataset</h2>
				<CardDescription>
					Choose a{" "}
					<code className="font-mono">processed_dataset</code>
					you have created earlier.
				</CardDescription>
			</div>
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					Loading datasets...
				</div>
			) : (
				<RadioCardGroup
					className="grid grid-cols-1 md:grid-cols-2 gap-4"
					onValueChange={value => {
						const id = value as string;
						setDatasetId(id);
						// update modality based on selected dataset
						const selected = datasets.find(
							ds => ds.datasetName === id,
						);
						setModality(selected?.modality ?? null);
					}}
				>
					{datasets.map(ds => (
						<RadioCardGroupItem
							key={ds.datasetName}
							value={ds.datasetName}
							checked={datasetId === ds.datasetName}
						>
							<div className="flex items-center gap-2 font-semibold mb-8">
								{ds.datasetName}
								{ds.modality === "vision" ? (
									<ImageIcon className="w-4 h-4" />
								) : (
									<FileTextIcon className="w-4 h-4" />
								)}
							</div>
							<div className="text-xs text-muted-foreground mb-1">
								Hugging Face ID:{" "}
								<span className="text-foreground font-medium">
									{ds.datasetId}
								</span>
							</div>
							<div className="text-xs text-muted-foreground mb-1">
								Source:{" "}
								<span className="text-foreground font-medium">
									{ds.datasetSource}
								</span>
							</div>
							<div className="text-xs text-muted-foreground mb-1">
								Splits:{" "}
								<span className="text-foreground font-medium">
									{ds.splits.join(", ")}
								</span>
							</div>
							<div className="text-xs text-muted-foreground">
								Examples:{" "}
								<span className="text-foreground font-medium">
									{ds.numExamples}
								</span>
							</div>
						</RadioCardGroupItem>
					))}
				</RadioCardGroup>
			)}
			<Button
				onClick={handleNext}
				disabled={!datasetId}
				className="w-full"
			>
				Next
			</Button>
		</div>
	);
}
