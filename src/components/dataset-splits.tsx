import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RadioCardGroup, RadioCardGroupItem } from "./ui/radio-card";

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
				<RadioCardGroup
					className="flex gap-2 flex-wrap"
					onValueChange={value => {
						setSelectedSplit(value);
					}}
				>
					{splits.map(split => (
						<RadioCardGroupItem
							key={split.name}
							value={split.name}
							id={split.name}
							className="grow min-w-[300px] max-w-1/2"
							checked={selectedSplit === split.name}
						>
							<div className="flex flex-col gap-0.5">
								<span>{split.name}</span>
								<span className="text-muted-foreground text-sm">
									{split.num_examples} examples
								</span>
							</div>
						</RadioCardGroupItem>
					))}
				</RadioCardGroup>
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
