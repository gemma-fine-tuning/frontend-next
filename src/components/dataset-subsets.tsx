import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
				<RadioGroup
					className="flex gap-2 flex-wrap"
					onValueChange={value => {
						setSelectedConfig(value);
					}}
				>
					{configs.map(config => (
						<Label
							htmlFor={config}
							className="p-3 bg-input/30 border border-input rounded-md flex gap-2 flex-row grow min-w-[300px] max-w-1/2 cursor-pointer hover:bg-input/50 transition-colors"
							key={config}
						>
							<RadioGroupItem
								value={config}
								id={config}
								className="rounded-md"
								checked={selectedConfig === config}
							/>
							<span>{config}</span>
						</Label>
					))}
				</RadioGroup>
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
