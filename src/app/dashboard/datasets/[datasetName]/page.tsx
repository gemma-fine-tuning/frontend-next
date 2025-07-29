"use client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDatasetDetail } from "@/hooks/useDatasetDetail";
import { cn } from "@/lib/utils";
import type { DatasetMessage, DatasetSplit } from "@/types/dataset";
import {
	AlertCircle,
	CalendarIcon,
	DatabaseIcon,
	ExternalLink,
	FileTextIcon,
	HashIcon,
	ImageIcon,
	Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, use } from "react";

const DatasetPage = ({
	params,
}: {
	params: Promise<{ datasetName: string }>;
}) => {
	const { datasetName } = use(params);
	const { data, loading, error } = useDatasetDetail(datasetName);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderMessage = (message: DatasetMessage) => {
		const contentKey =
			typeof message.content === "string"
				? message.content.slice(0, 20)
				: message.content
						.map(part =>
							part.type === "text"
								? part.text.slice(0, 20)
								: part.image.slice(0, 20),
						)
						.join("-");

		return (
			<div
				key={`${message.role}-${contentKey}`}
				className={`p-3 rounded-lg flex gap-2 items-start ${
					message.role === "system"
						? "bg-blue-950/20 border border-blue-800/30"
						: message.role === "user"
							? "bg-muted border border-border"
							: "bg-green-950/20 border border-green-800/30"
				}`}
			>
				<Badge variant="outline" className="text-xs">
					{message.role}
				</Badge>
				<div className="text-sm whitespace-pre-wrap">
					{typeof message.content === "string" ? (
						<p>{message.content}</p>
					) : (
						<div className="flex flex-col gap-2">
							{message.content.map(part => (
								<div
									key={
										part.type === "text"
											? part.text
											: part.image
									}
								>
									{part.type === "text" ? (
										<p>{part.text}</p>
									) : (
										<Image
											src={part.image}
											alt="User image"
											width={200}
											height={200}
											className="rounded-md"
										/>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	};

	const renderSplit = (split: DatasetSplit) => (
		<Card key={split.split_name} className="">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileTextIcon className="w-5 h-5" />
					{split.split_name}
				</CardTitle>
				<CardDescription>
					{split.num_rows.toLocaleString()} examples
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Accordion
						type="single"
						collapsible
						className="w-full border border-input/30 rounded-md px-4 bg-card"
					>
						<AccordionItem value="sample-conversations">
							<AccordionTrigger className="cursor-pointer">
								Sample Conversations
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-4">
									{split.samples.map((sample, index) => (
										<Card
											key={`sample-${index}-${sample.messages[0]?.content.slice(0, 20)}`}
											className="border-dashed"
										>
											<CardContent className="">
												<div className="space-y-3">
													{sample.messages.map(
														(message, msgIndex) =>
															renderMessage(
																message,
															),
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			<Suspense fallback={<div>Loading...</div>}>
				{loading && (
					<Card>
						<CardContent className="flex items-center justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin mr-2" />
							Loading dataset details...
						</CardContent>
					</Card>
				)}

				{error && (
					<Card>
						<CardContent className="flex items-center gap-2 py-8 text-destructive">
							<AlertCircle className="w-5 h-5" />
							{error}
						</CardContent>
					</Card>
				)}

				{data && (
					<div className="space-y-6">
						{/* Dataset Overview */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DatabaseIcon className="w-5 h-5" />
									{data.dataset_name}
									{data.modality === "vision" ? (
										<ImageIcon className="w-4 h-4" />
									) : (
										<FileTextIcon className="w-4 h-4" />
									)}
								</CardTitle>
								<CardDescription>
									Dataset details and configuration
								</CardDescription>
								{data.dataset_source === "huggingface" && (
									<CardAction>
										<Link
											href={`https://huggingface.co/datasets/${data.dataset_id}`}
											target="_blank"
											className={cn(
												buttonVariants({
													variant: "outline",
												}),
											)}
										>
											View on Hugging Face{" "}
											<ExternalLink />
										</Link>
									</CardAction>
								)}
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-sm">
											<HashIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												ID:
											</span>
											<span className="font-mono text-xs bg-muted px-2 py-1 rounded">
												{data.dataset_id}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<DatabaseIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Source:
											</span>
											<Badge variant="outline">
												{data.dataset_source ===
												"upload"
													? "local"
													: "huggingface"}
											</Badge>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<FileTextIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Subset:
											</span>
											<Badge variant="outline">
												{data.dataset_subset}
											</Badge>
										</div>
									</div>
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-sm">
											<CalendarIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Created:
											</span>
											<span>
												{formatDate(data.created_at)}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<FileTextIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Splits:
											</span>
											<div className="flex gap-1 flex-wrap">
												{data.splits.map(split => (
													<Badge
														key={split.split_name}
														variant="outline"
														className="text-xs"
													>
														{split.split_name}
													</Badge>
												))}
											</div>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<HashIcon className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">
												Total Examples:
											</span>
											<span>
												{data.splits
													.reduce(
														(total, split) =>
															total +
															split.num_rows,
														0,
													)
													.toLocaleString()}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Dataset Splits */}
						{data.splits.map(renderSplit)}
					</div>
				)}
			</Suspense>
		</div>
	);
};

export default DatasetPage;
