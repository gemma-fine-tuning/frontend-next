"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
	queued: "bg-yellow-500",
	preparing: "bg-yellow-500",
	training: "bg-blue-500",
	completed: "bg-green-500",
	failed: "bg-red-500",
};

export type TrainingJobCardProps = {
	job: {
		job_id: string;
		job_status?: string;
		base_model_id?: string;
		job_name?: string;
	};
};

export default function TrainingJobCard({ job }: TrainingJobCardProps) {
	const color = statusColor[job.job_status ?? "unknown"] ?? "bg-muted";
	return (
		<Card className="hover:bg-muted/30 transition-colors duration-200">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{job.job_name ?? job.job_id}
					{job.job_status && (
						<span className={cn("w-2 h-2 rounded-full", color)} />
					)}
				</CardTitle>
				<CardDescription className="capitalize">
					Status: {job.job_status ?? "—"}
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
	);
}
