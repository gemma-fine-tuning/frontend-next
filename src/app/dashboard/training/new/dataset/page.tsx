"use client";

import { trainingDatasetIdAtom, trainingModelAtom } from "@/atoms";
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
		<div className="max-w-xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Select Dataset</CardTitle>
					<CardDescription>
						Enter the ID of a{" "}
						<code className="font-mono">processed_dataset</code> you
						have created earlier.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Input
						placeholder="e.g. 44a2727c-f8e5-4fad-87e3-eae071230157"
						value={datasetId}
						onChange={e => setDatasetId(e.target.value)}
						required
					/>
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
