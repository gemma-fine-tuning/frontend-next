"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
import { BarChart3, Zap } from "lucide-react";

export type EvaluationMode = "metrics" | "batch_inference";

interface EvaluationModeSelectorProps {
	selectedMode: EvaluationMode | null;
	onModeSelect: (mode: EvaluationMode) => void;
}

export default function EvaluationModeSelector({
	selectedMode,
	onModeSelect,
}: EvaluationModeSelectorProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Select Evaluation Mode</CardTitle>
			</CardHeader>
			<CardContent>
				<RadioCardGroup
					className="grid grid-cols-1 md:grid-cols-2 gap-4"
					value={selectedMode || ""}
					onValueChange={value =>
						onModeSelect(value as EvaluationMode)
					}
				>
					<RadioCardGroupItem value="metrics" className="p-6">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<BarChart3 className="w-5 h-5" />
								<span className="font-medium">
									Metric-Based Evaluation
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Evaluate model performance using standard
								metrics like ROUGE, BLEU, BERTScore, and more.
							</p>
						</div>
					</RadioCardGroupItem>

					<RadioCardGroupItem value="batch_inference" className="p-6">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Zap className="w-5 h-5" />
								<span className="font-medium">
									Vibe Check (Batch Inference)
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Run inference on selected samples and compare
								outputs manually for qualitative assessment.
							</p>
						</div>
					</RadioCardGroupItem>
				</RadioCardGroup>
			</CardContent>
		</Card>
	);
}
