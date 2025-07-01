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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	hfDatasetConfigsAtom,
	hfDatasetConfigsLoadingAtom,
	hfDatasetIdAtom,
	hfDatasetSelectedConfigAtom,
} from "@/states";
import { useAtom } from "jotai";
import { BadgeCheckIcon, Loader2, Search } from "lucide-react";
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
			}

			if (data.configs.length === 1) {
				setHfDatasetSelectedConfig(data.configs[0]);
			}
		} catch (error) {
			console.error("Error fetching dataset configs:", error);
			toast.error("Error fetching dataset configs", { duration: 6000 });
		} finally {
			setHfDatasetConfigsLoading(false);
		}
	};

	const handleHfDatasetPreview = async () => {
		try {
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

			const state = {
				dataset_id: hfDatasetId,
				config_name: hfDatasetSelectedConfig,
			};

			toast(JSON.stringify(state));
		} catch (error) {
			console.error("Error fetching dataset preview:", error);
			toast.error("Error fetching dataset preview", { duration: 6000 });
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
									value={hfDatasetId}
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
					Change your password here.
				</TabsContent>
				<TabsContent value="custom">
					Change your password here.
				</TabsContent>
			</Tabs>

			{/* Dataset Subset Selection if Available */}
			{hfDatasetConfigsLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading dataset subsets...</span>
				</div>
			)}

			{hfDatasetConfigs.length === 1 && !hfDatasetConfigsLoading && (
				<Card>
					<CardHeader>
						<CardTitle>Dataset Subsets</CardTitle>
						<CardDescription>
							Select a dataset subset to preview and process.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-md p-3">
							<BadgeCheckIcon className="text-primary" /> Only one
							subset available: "{hfDatasetConfigs[0]}". Selected
							it automatically.
						</div>
						<Button
							className="cursor-pointer"
							onClick={handleHfDatasetPreview}
						>
							Preview Dataset
						</Button>
					</CardContent>
				</Card>
			)}

			{hfDatasetConfigs.length > 1 && !hfDatasetConfigsLoading && (
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
									className="p-3 bg-input/30 border border-input rounded-md flex gap-2 flex-row grow min-w-[300px] cursor-pointer hover:bg-input/50 transition-colors"
									key={config}
								>
									<RadioGroupItem
										value={config}
										id={config}
										className="rounded-md"
									/>
									<span>{config}</span>
								</Label>
							))}
						</RadioGroup>
						<Button
							className="cursor-pointer"
							onClick={handleHfDatasetPreview}
							disabled={hfDatasetSelectedConfig === ""}
						>
							Preview Dataset
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default DatasetSelection;
