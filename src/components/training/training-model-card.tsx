"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export type TrainingModelCardProps = {
	modelId: string;
	provider: "unsloth" | "huggingface";
	selected?: boolean;
	onSelect?: () => void;
};

const providerLabel = {
	huggingface: "Hugging Face",
	unsloth: "Unsloth",
};

export default function TrainingModelCard({
	modelId,
	provider,
	selected = false,
	onSelect,
}: TrainingModelCardProps) {
	return (
		<Card
			onClick={onSelect}
			className={cn(
				"cursor-pointer transition-colors border-2 hover:border-blue-300 relative",
				selected
					? "border-blue-500 ring-2 ring-blue-300"
					: "border-transparent",
			)}
		>
			{selected && (
				<CheckCircle2 className="absolute top-2 right-2 text-blue-500" />
			)}
			<CardHeader>
				<CardTitle className="text-base break-words leading-snug">
					{modelId}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<span className="text-xs text-muted-foreground capitalize">
					Provider: {providerLabel[provider]}
				</span>
			</CardContent>
		</Card>
	);
}
