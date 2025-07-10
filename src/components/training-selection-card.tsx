"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export type SelectionCardProps = {
	title: ReactNode;
	selected?: boolean;
	onSelect?: () => void;
	children?: ReactNode;
};

export default function SelectionCard({
	title,
	selected = false,
	onSelect,
	children,
}: SelectionCardProps) {
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
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
