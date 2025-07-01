"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	hfDatasetConfigsAtom,
	hfDatasetConfigsLoadingAtom,
	hfDatasetIdAtom,
	hfDatasetPreviewLoadingAtom,
	hfDatasetPreviewRowsAtom,
	hfDatasetSelectedConfigAtom,
	hfDatasetSelectedSplitAtom,
	hfDatasetSplitsAtom,
	hfDatasetSplitsLoadingAtom,
} from "@/states";
import { useAtom } from "jotai";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
const DatasetSelection = () => {
	const [hfDatasetId, setHfDatasetId] = useAtom(hfDatasetIdAtom);
	const [hfDatasetConfigs, setHfDatasetConfigs] =
		useAtom(hfDatasetConfigsAtom);
	const [hfDatasetConfigsLoading, setHfDatasetConfigsLoading] = useAtom(
		hfDatasetConfigsLoadingAtom,
	);
	const [hfDatasetSelectedConfig, setHfDatasetSelectedConfig] = useAtom(
		hfDatasetSelectedConfigAtom,
	);
	const [hfDatasetSplitsLoading, setHfDatasetSplitsLoading] = useAtom(
		hfDatasetSplitsLoadingAtom,
	);
	const [hfDatasetSplits, setHfDatasetSplits] = useAtom(hfDatasetSplitsAtom);
	const [hfDatasetSelectedSplit, setHfDatasetSelectedSplit] = useAtom(
		hfDatasetSelectedSplitAtom,
	);
	const [hfDatasetPreviewLoading, setHfDatasetPreviewLoading] = useAtom(
		hfDatasetPreviewLoadingAtom,
	);
	const [hfDatasetPreviewRows, setHfDatasetPreviewRows] = useAtom(
		hfDatasetPreviewRowsAtom,
	);

	const handleHfAvailableConfigs = async () => {
		if (!hfDatasetId) {
			toast.error("Please enter a Hugging Face dataset ID", {
				duration: 6000,
			});
			return;
		}

		setHfDatasetConfigsLoading(true);
		setHfDatasetConfigs([]);
		setHfDatasetSelectedConfig("");
		setHfDatasetSplits([]);
		setHfDatasetSelectedSplit("");

		try {
			const response = await fetch("/api/datasets/hf/config", {
				method: "POST",
				body: JSON.stringify({ dataset_id: hfDatasetId }),
			});

			const data = await response.json();

			if (data.error) {
				toast.error(data.error, { duration: 6000 });
				return;
			}

			if (data.configs) {
				setHfDatasetConfigs(data.configs);
				if (data.configs.length > 0) {
					setHfDatasetSelectedConfig(data.configs[0]);
				}
			}
		} catch (error) {
			console.error("Error fetching dataset configs:", error);
			toast.error("Error fetching dataset configs", { duration: 6000 });
		} finally {
			setHfDatasetConfigsLoading(false);
		}
	};

	const handleHfDatasetSplits = async () => {
		if (!hfDatasetId) {
			toast.error("Please enter a Hugging Face dataset ID", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetSelectedConfig) {
			toast.error("Please select a dataset subset", {
				duration: 6000,
			});
			return;
		}

		setHfDatasetSplitsLoading(true);
		setHfDatasetSplits([]);
		setHfDatasetSelectedSplit("");
		setHfDatasetPreviewRows([]);

		try {
			const response = await fetch("/api/datasets/hf/information", {
				method: "POST",
				body: JSON.stringify({
					dataset_id: hfDatasetId,
					config: hfDatasetSelectedConfig,
				}),
			});

			const data = await response.json();

			if (data.error) {
				toast.error(data.error, { duration: 6000 });
				return;
			}
			if (data.splits) {
				const splitsArray = Object.keys(data.splits).map(split => ({
					name: split,
					num_examples: data.splits[split].num_examples,
				}));

				setHfDatasetSplits(splitsArray);

				if (splitsArray.length > 0) {
					setHfDatasetSelectedSplit(splitsArray[0].name);
				}
			}
		} catch (error) {
			console.error("Error fetching dataset preview:", error);
			toast.error("Error fetching dataset preview", { duration: 6000 });
		} finally {
			setHfDatasetSplitsLoading(false);
		}
	};

	const handleHfDatasetPreview = async () => {
		if (!hfDatasetId) {
			toast.error("Please enter a Hugging Face dataset ID", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetSelectedSplit) {
			toast.error("Please select a dataset split", {
				duration: 6000,
			});
			return;
		}

		if (!hfDatasetSelectedConfig) {
			toast.error("Please select a dataset subset", {
				duration: 6000,
			});
			return;
		}

		setHfDatasetPreviewLoading(true);
		setHfDatasetPreviewRows([]);

		try {
			const datasetPreview = await fetch("/api/datasets/hf/preview", {
				method: "POST",
				body: JSON.stringify({
					dataset_id: hfDatasetId,
					config: hfDatasetSelectedConfig,
					split: hfDatasetSelectedSplit,
				}),
			});

			const datasetPreviewData = await datasetPreview.json();

			if (datasetPreviewData.rows) {
				const rows = datasetPreviewData.rows.map(
					(rowObj: { row: Record<string, unknown> }) => {
						const row: Record<string, string> = {};
						for (const [key, value] of Object.entries(
							rowObj.row as Record<string, unknown>,
						)) {
							if (Array.isArray(value)) {
								row[key] = JSON.stringify(value);
							} else {
								row[key] = String(value);
							}
						}
						return { row };
					},
				);
				setHfDatasetPreviewRows(rows);
			}
		} catch (error) {
			console.error("Error fetching dataset preview:", error);
			toast.error("Error fetching dataset preview", { duration: 6000 });
		} finally {
			setHfDatasetPreviewLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<Tabs defaultValue="huggingface" className="">
				<TabsList>
					<TabsTrigger value="huggingface">
						Hugging Face Datasets
					</TabsTrigger>
					<TabsTrigger value="sample">Sample Datasets</TabsTrigger>
					<TabsTrigger value="custom">Custom Dataset</TabsTrigger>
				</TabsList>
				<TabsContent value="huggingface">
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Hugging Face Dataset</CardTitle>
							<CardDescription>
								Enter the ID of the Hugging Face dataset to
								preprocess it for finetuning.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex gap-2 items-end">
							<div className="space-y-3 w-full">
								<Label htmlFor="hfDatasetId">
									Hugging Face Dataset ID
								</Label>
								<Input
									type="text"
									placeholder="Enter a Hugging Face dataset ID"
									value={hfDatasetId || ""}
									onChange={e =>
										setHfDatasetId(e.target.value)
									}
								/>
							</div>
							<Button
								className="cursor-pointer"
								onClick={handleHfAvailableConfigs}
								disabled={hfDatasetConfigsLoading}
							>
								{hfDatasetConfigsLoading ? (
									<Loader2 className="animate-spin" />
								) : (
									<Search />
								)}
								Check Available Subsets
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="sample">
					<p>Sample datasets functionality coming soon.</p>
				</TabsContent>
				<TabsContent value="custom">
					<p>Custom dataset upload coming soon.</p>
				</TabsContent>
			</Tabs>

			{/* Dataset Subset Selection if Available */}
			{hfDatasetConfigsLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading dataset subsets...</span>
				</div>
			)}

			{hfDatasetConfigs.length > 0 && !hfDatasetConfigsLoading && (
				<Card>
					<CardHeader>
						<CardTitle>Dataset Subsets</CardTitle>
						<CardDescription>
							Select a dataset subset to preview and process.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<RadioGroup
							className="flex gap-2 flex-wrap"
							onValueChange={value => {
								setHfDatasetSelectedConfig(value);
							}}
						>
							{hfDatasetConfigs.map(config => (
								<Label
									htmlFor={config}
									className="p-3 bg-input/30 border border-input rounded-md flex gap-2 flex-row grow min-w-[300px] max-w-1/2 cursor-pointer hover:bg-input/50 transition-colors"
									key={config}
								>
									<RadioGroupItem
										value={config}
										id={config}
										className="rounded-md"
										checked={
											hfDatasetSelectedConfig === config
										}
									/>
									<span>{config}</span>
								</Label>
							))}
						</RadioGroup>
						<Button
							className="cursor-pointer"
							onClick={handleHfDatasetSplits}
							disabled={hfDatasetSelectedConfig === ""}
						>
							Preview Dataset
						</Button>
					</CardContent>
				</Card>
			)}

			{hfDatasetSplitsLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading dataset splits...</span>
				</div>
			)}

			{hfDatasetSplits.length > 0 && !hfDatasetSplitsLoading && (
				<Card>
					<CardHeader className="border-b border-input">
						<CardTitle>Dataset Preview</CardTitle>
						<CardDescription>
							Below is a preview of the dataset split you select
							along with other information.
						</CardDescription>
					</CardHeader>
					<CardContent className="border-b border-input space-y-4">
						<h3 className="font-semibold mb-1">Available Splits</h3>
						<p className="text-muted-foreground text-sm mb-4">
							Select a dataset split to preview and process.
						</p>
						<RadioGroup
							className="flex gap-2 flex-wrap"
							onValueChange={value => {
								setHfDatasetSelectedSplit(value);
							}}
						>
							{hfDatasetSplits.map(split => (
								<Label
									htmlFor={split.name}
									key={split.name}
									className="p-3 bg-input/30 border border-input rounded-md flex gap-4 flex-row grow min-w-[300px] max-w-1/2 cursor-pointer hover:bg-input/50 transition-colors"
								>
									<RadioGroupItem
										value={split.name}
										id={split.name}
										checked={
											hfDatasetSelectedSplit ===
											split.name
										}
									/>
									<div className="flex flex-col gap-2">
										<span>{split.name}</span>
										<span className="text-muted-foreground">
											{split.num_examples} examples
										</span>
									</div>
								</Label>
							))}
						</RadioGroup>
						<Button
							className="cursor-pointer"
							onClick={handleHfDatasetPreview}
							disabled={hfDatasetSelectedSplit === ""}
						>
							Preview Dataset
						</Button>
					</CardContent>
					<CardContent className="">
						{hfDatasetPreviewLoading && (
							<div className="flex items-center gap-2 my-10 justify-center">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Loading dataset preview...</span>
							</div>
						)}

						{!hfDatasetPreviewLoading &&
							hfDatasetPreviewRows.length > 0 && (
								<div className="">
									<h3 className="font-semibold mb-1">
										Dataset
									</h3>
									<p className="text-muted-foreground text-sm mb-4">
										Below is a preview of the dataset split
										you select along with other information.
									</p>
									<div className="rounded-md border border-input">
										<Table className="">
											<TableCaption>
												Dataset preview
											</TableCaption>
											<TableHeader>
												<TableRow className="bg-input/30">
													{Object.keys(
														hfDatasetPreviewRows[0]
															.row,
													).map(col => {
														return (
															<TableHead
																key={col}
																className=""
															>
																<div className="flex gap-3 items-center justify-center">
																	<span>
																		{col}
																	</span>
																</div>
															</TableHead>
														);
													})}
												</TableRow>
											</TableHeader>
											<TableBody className="rounded-md">
												{hfDatasetPreviewRows.map(
													(rowObj, i) => {
														const key =
															rowObj.row
																.question_id ||
															rowObj.row
																.plot_id ||
															i;
														return (
															<TableRow key={key}>
																{Object.keys(
																	rowObj.row,
																).map(col => {
																	const value =
																		rowObj
																			.row[
																			col
																		];
																	return (
																		<TableCell
																			key={
																				col
																			}
																		>
																			<span
																				className={
																					"truncate max-w-[300px] inline-block align-bottom"
																				}
																			>
																				{
																					value
																				}
																			</span>
																		</TableCell>
																	);
																})}
															</TableRow>
														);
													},
												)}
											</TableBody>
										</Table>
									</div>
								</div>
							)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default DatasetSelection;
