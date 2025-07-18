import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RadioCardGroup, RadioCardGroupItem } from "./ui/radio-card";

const DatasetSubsets = ({
	configs,
	selectedConfig,
	setSelectedConfig,
	handleDatasetSplits,
}: {
	configs: string[];
	selectedConfig: string;
	setSelectedConfig: (config: string) => void;
	handleDatasetSplits: () => void;
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Available Subsets</CardTitle>
				<CardDescription>
					Select a dataset subset to preview and process.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<RadioCardGroup
					className="flex gap-2 flex-wrap"
					onValueChange={value => {
						setSelectedConfig(value);
					}}
				>
					{configs.map(config => (
						<RadioCardGroupItem
							key={config}
							value={config}
							id={config}
							className="grow min-w-[300px] max-w-1/2"
							checked={selectedConfig === config}
						>
							<span>{config}</span>
						</RadioCardGroupItem>
					))}
				</RadioCardGroup>
				<Button
					className="cursor-pointer"
					onClick={handleDatasetSplits}
					disabled={selectedConfig === ""}
				>
					Preview Dataset
				</Button>
			</CardContent>
		</Card>
	);
};

export default DatasetSubsets;
