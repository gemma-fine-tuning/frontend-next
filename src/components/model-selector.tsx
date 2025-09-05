"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioCardGroup, RadioCardGroupItem } from "@/components/ui/radio-card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrainingJobs } from "@/hooks/useTrainingJobs";
import { supportedModels } from "@/lib/models";
import type { TrainingJob } from "@/types/training";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export interface SelectedModel {
	type: "base" | "trained";
	modelId?: string;
	job?: TrainingJob;
}

export interface ComparisonModels {
	isComparison: boolean;
	model1: SelectedModel | null;
	model2: SelectedModel | null;
}

interface ModelSelectorProps {
	selectedModel?: SelectedModel | null;
	onModelSelect?: (model: SelectedModel) => void;
	// New props for comparison mode
	comparisonModels?: ComparisonModels;
	onComparisonChange?: (comparison: ComparisonModels) => void;
}

export default function ModelSelector({
	selectedModel,
	onModelSelect,
	comparisonModels,
	onComparisonChange,
}: ModelSelectorProps) {
	const [activeTab, setActiveTab] = useState<"base" | "trained">("base");
	const {
		jobs,
		loading: jobsLoading,
		error: jobsError,
		refresh,
	} = useTrainingJobs();

	// Determine if we're in comparison mode
	const isComparisonMode = comparisonModels?.isComparison || false;
	const currentComparison = comparisonModels || {
		isComparison: false,
		model1: null,
		model2: null,
	};

	// Only show jobs with completed status (detailed info will be fetched when selected)
	const availableJobs = jobs.filter(job => job.status === "completed");

	const handleComparisonToggle = (enabled: boolean) => {
		if (onComparisonChange) {
			onComparisonChange({
				isComparison: enabled,
				model1: enabled ? currentComparison.model1 : null,
				model2: enabled ? currentComparison.model2 : null,
			});
		}
	};

	const handleBaseModelSelect = (modelId: string, modelSlot?: 1 | 2) => {
		const newModel: SelectedModel = { type: "base", modelId };

		if (isComparisonMode && onComparisonChange) {
			// In comparison mode, update the specific model slot
			const slot = modelSlot || 1;
			onComparisonChange({
				...currentComparison,
				[`model${slot}`]: newModel,
			});
		} else if (onModelSelect) {
			// Single model mode
			onModelSelect(newModel);
		}
	};

	const handleTrainedModelSelect = (job: TrainingJob, modelSlot?: 1 | 2) => {
		const newModel: SelectedModel = { type: "trained", job };

		if (isComparisonMode && onComparisonChange) {
			// In comparison mode, update the specific model slot
			const slot = modelSlot || 1;
			onComparisonChange({
				...currentComparison,
				[`model${slot}`]: newModel,
			});
		} else if (onModelSelect) {
			// Single model mode
			onModelSelect(newModel);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>
						Select Model{isComparisonMode ? "s" : ""}
					</CardTitle>
					<div className="flex items-center space-x-2">
						<Label htmlFor="comparison-mode" className="text-sm">
							Compare Models
						</Label>
						<Switch
							id="comparison-mode"
							checked={isComparisonMode}
							onCheckedChange={handleComparisonToggle}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isComparisonMode ? (
					<div className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Model 1 Selection */}
							<div className="space-y-4">
								<h3 className="font-medium text-sm text-muted-foreground">
									Model 1
								</h3>
								<Tabs
									value={activeTab}
									onValueChange={value =>
										setActiveTab(
											value as "base" | "trained",
										)
									}
								>
									<TabsList className="grid w-full grid-cols-2">
										<TabsTrigger value="base">
											Base Models
										</TabsTrigger>
										<TabsTrigger value="trained">
											Trained Models
										</TabsTrigger>
									</TabsList>

									<TabsContent
										value="base"
										className="space-y-4"
									>
										<RadioCardGroup
											className="grid grid-cols-1 gap-2"
											value={
												currentComparison.model1
													?.type === "base"
													? currentComparison.model1
															.modelId
													: ""
											}
											onValueChange={modelId =>
												handleBaseModelSelect(
													modelId,
													1,
												)
											}
										>
											{supportedModels.map(model => (
												<RadioCardGroupItem
													key={model}
													value={model}
													className="p-3"
												>
													<div className="font-mono text-sm">
														{model}
													</div>
												</RadioCardGroupItem>
											))}
										</RadioCardGroup>
									</TabsContent>

									<TabsContent
										value="trained"
										className="space-y-4"
									>
										<div className="space-y-3">
											{availableJobs.map(job => (
												<Card
													key={job.job_id}
													className={`cursor-pointer transition-colors hover:bg-muted/50 ${
														currentComparison.model1
															?.type ===
															"trained" &&
														currentComparison.model1
															.job?.job_id ===
															job.job_id
															? "ring-2 ring-primary"
															: ""
													}`}
													onClick={() =>
														handleTrainedModelSelect(
															job,
															1,
														)
													}
												>
													<CardContent className="p-3">
														<div className="space-y-1">
															<div className="font-medium text-sm">
																{job.job_name ||
																	job.job_id}
															</div>
															<div className="text-xs text-muted-foreground">
																{job.base_model_id ||
																	"N/A"}
															</div>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									</TabsContent>
								</Tabs>
							</div>

							{/* Model 2 Selection */}
							<div className="space-y-4">
								<h3 className="font-medium text-sm text-muted-foreground">
									Model 2
								</h3>
								<Tabs
									value={activeTab}
									onValueChange={value =>
										setActiveTab(
											value as "base" | "trained",
										)
									}
								>
									<TabsList className="grid w-full grid-cols-2">
										<TabsTrigger value="base">
											Base Models
										</TabsTrigger>
										<TabsTrigger value="trained">
											Trained Models
										</TabsTrigger>
									</TabsList>

									<TabsContent
										value="base"
										className="space-y-4"
									>
										<RadioCardGroup
											className="grid grid-cols-1 gap-2"
											value={
												currentComparison.model2
													?.type === "base"
													? currentComparison.model2
															.modelId
													: ""
											}
											onValueChange={modelId =>
												handleBaseModelSelect(
													modelId,
													2,
												)
											}
										>
											{supportedModels.map(model => (
												<RadioCardGroupItem
													key={model}
													value={model}
													className="p-3"
												>
													<div className="font-mono text-sm">
														{model}
													</div>
												</RadioCardGroupItem>
											))}
										</RadioCardGroup>
									</TabsContent>

									<TabsContent
										value="trained"
										className="space-y-4"
									>
										<div className="space-y-3">
											{availableJobs.map(job => (
												<Card
													key={job.job_id}
													className={`cursor-pointer transition-colors hover:bg-muted/50 ${
														currentComparison.model2
															?.type ===
															"trained" &&
														currentComparison.model2
															.job?.job_id ===
															job.job_id
															? "ring-2 ring-primary"
															: ""
													}`}
													onClick={() =>
														handleTrainedModelSelect(
															job,
															2,
														)
													}
												>
													<CardContent className="p-3">
														<div className="space-y-1">
															<div className="font-medium text-sm">
																{job.job_name ||
																	job.job_id}
															</div>
															<div className="text-xs text-muted-foreground">
																{job.base_model_id ||
																	"N/A"}
															</div>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									</TabsContent>
								</Tabs>
							</div>
						</div>
					</div>
				) : (
					/* Single Model Selection - Original Layout */
					<Tabs
						value={activeTab}
						onValueChange={value =>
							setActiveTab(value as "base" | "trained")
						}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="base">Base Models</TabsTrigger>
							<TabsTrigger value="trained">
								Trained Models
							</TabsTrigger>
						</TabsList>

						<TabsContent value="base" className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Select from supported base models for
								evaluation.
							</p>
							<RadioCardGroup
								className="grid grid-cols-1 md:grid-cols-2 gap-3"
								value={
									selectedModel?.type === "base"
										? selectedModel.modelId
										: ""
								}
								onValueChange={modelId =>
									handleBaseModelSelect(modelId)
								}
							>
								{supportedModels.map(model => (
									<RadioCardGroupItem
										key={model}
										value={model}
										className="p-3"
									>
										<div className="font-mono text-sm">
											{model}
										</div>
									</RadioCardGroupItem>
								))}
							</RadioCardGroup>
						</TabsContent>

						<TabsContent value="trained" className="space-y-4">
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									Select from your completed training jobs.
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={refresh}
									disabled={jobsLoading}
								>
									{jobsLoading ? (
										<Loader2 className="w-3 h-3 animate-spin" />
									) : (
										"Refresh"
									)}
								</Button>
							</div>

							{jobsLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="w-6 h-6 animate-spin" />
								</div>
							) : jobsError ? (
								<div className="text-red-600 text-sm">
									Error: {jobsError}
								</div>
							) : availableJobs.length === 0 ? (
								<div className="text-muted-foreground text-sm py-8 text-center">
									No completed training jobs available.
								</div>
							) : (
								<div className="space-y-3">
									{availableJobs.map(job => (
										<Card
											key={job.job_id}
											className={`cursor-pointer transition-colors hover:bg-muted/50 ${
												selectedModel?.type ===
													"trained" &&
												selectedModel.job?.job_id ===
													job.job_id
													? "ring-2 ring-primary"
													: ""
											}`}
											onClick={() =>
												handleTrainedModelSelect(job)
											}
										>
											<CardContent className="p-4">
												<div className="space-y-2">
													<div className="font-medium">
														{job.job_name ||
															job.job_id}
													</div>
													<div className="text-sm text-muted-foreground">
														Status: {job.status}
													</div>
													<div className="text-sm text-muted-foreground">
														Base:{" "}
														{job.base_model_id ||
															"N/A"}
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				)}
			</CardContent>
		</Card>
	);
}
