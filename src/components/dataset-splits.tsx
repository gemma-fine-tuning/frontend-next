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

const DatasetSplits = ({
	splits,
	selectedSplit,
	setSelectedSplit,
	handleDatasetPreview,
}: {
	splits: { name: string; num_examples: number }[];
	selectedSplit: string;
	setSelectedSplit: (split: string) => void;
	handleDatasetPreview: () => void;
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Available Splits</CardTitle>
				<CardDescription>
					Select a dataset split to preview and process.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<RadioGroup
					className="flex gap-2 flex-wrap"
					onValueChange={value => {
						setSelectedSplit(value);
					}}
				>
					{splits.map(split => (
						<Label
							htmlFor={split.name}
							key={split.name}
							className="p-3 bg-input/30 border border-input rounded-md flex gap-4 flex-row grow min-w-[300px] max-w-1/2 cursor-pointer hover:bg-input/50 transition-colors"
						>
							<RadioGroupItem
								value={split.name}
								id={split.name}
								checked={selectedSplit === split.name}
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
					onClick={handleDatasetPreview}
					disabled={selectedSplit === ""}
				>
					Preview Dataset
				</Button>
			</CardContent>
		</Card>
	);
};

export default DatasetSplits;
