"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TrainingJob } from "@/types/training";
import { FileTextIcon, ImageIcon } from "lucide-react";
import Link from "next/link";

const statusColor: Record<string, string> = {
	queued: "bg-yellow-500",
	preparing: "bg-yellow-500",
	training: "bg-blue-500",
	completed: "bg-green-500",
	failed: "bg-red-500",
};

export type TrainingJobCardProps = {
	job: TrainingJob;
};

export default function TrainingJobCard({ job }: TrainingJobCardProps) {
	const color = statusColor[job.status ?? "unknown"] ?? "bg-muted";
	const ModalityIcon = job.modality === "vision" ? ImageIcon : FileTextIcon;

	return (
		// This already has a link so do not wrap this in a Link component
		<Link href={`/dashboard/training/${job.job_id}`}>
			<Card className="hover:bg-muted/30 transition-colors duration-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{job.job_name ?? job.job_id}
						{job.status && (
							<span
								className={cn("w-2 h-2 rounded-full", color)}
							/>
						)}
						{job.modality && <ModalityIcon className="w-4 h-4" />}
					</CardTitle>
					<CardDescription className="capitalize">
						Status: {job.status ?? "—"}
					</CardDescription>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					<p>
						Model:{" "}
						<span className="font-medium text-foreground">
							{job.base_model_id ?? "-"}
						</span>
					</p>
					<p>
						Job ID:{" "}
						<span className="font-medium text-foreground">
							{job.job_id}
						</span>
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}
