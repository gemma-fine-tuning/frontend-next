"use client";

import { trainingDatasetIdAtom, trainingModelAtom } from "@/atoms";
import { datasetsAtom, datasetsLoadingAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function DatasetSelectionPage() {
	const [datasetId, setDatasetId] = useAtom(trainingDatasetIdAtom);
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
		<div className="max-w-4xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Select Dataset</CardTitle>
					<CardDescription>
						Choose a{" "}
						<code className="font-mono">processed_dataset</code> you
						have created earlier.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							Loading datasets...
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{datasets.map(ds => (
								<Card
									key={ds.datasetName}
									className={`cursor-pointer border-2 transition-colors ${datasetId === ds.datasetName ? "border-blue-500" : "border-transparent"}`}
									onClick={() => setDatasetId(ds.datasetName)}
								>
									<CardHeader>
										<CardTitle className="text-base">
											{ds.datasetName}
										</CardTitle>
										<CardDescription>
											Hugging Face ID: {ds.datasetId}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div>Source: {ds.datasetSource}</div>
										<div>Subset: {ds.datasetSubset}</div>
										<div>Examples: {ds.numExamples}</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
				<CardFooter>
					<Button
						onClick={handleNext}
						disabled={!datasetId}
						className="w-full"
					>
						Next
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
