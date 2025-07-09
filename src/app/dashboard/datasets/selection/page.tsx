"use client";

import HFDatasetSelector from "@/components/hf-dataset-selector";
import LocalDatasetSelector from "@/components/local-dataset-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DatasetSelection = () => {
	return (
		<div className="">
			<Tabs defaultValue="huggingface" className="">
				<TabsList className="w-full">
					<TabsTrigger value="huggingface">
						Hugging Face Datasets
					</TabsTrigger>
					<TabsTrigger value="custom">Custom Dataset</TabsTrigger>
				</TabsList>
				<TabsContent value="huggingface">
					<HFDatasetSelector />
				</TabsContent>
				<TabsContent value="custom">
					<LocalDatasetSelector />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DatasetSelection;
