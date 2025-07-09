import type { DatasetSample } from "@/atoms";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

const DatasetCard = ({ dataset }: { dataset: DatasetSample }) => {
	return (
		<Link href={`/dashboard/datasets/${dataset.datasetName}`}>
			<Card className="hover:bg-muted/30 transition-colors duration-200">
				<CardHeader>
					<CardTitle>{dataset.datasetName}</CardTitle>
					<CardDescription>
						{new Date(dataset.createdAt).toLocaleString()}
					</CardDescription>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					<p>
						Total examples:{" "}
						<span className="font-medium text-foreground">
							{dataset.numExamples}
						</span>
					</p>
					<p>
						Splits:{" "}
						<span className="font-medium text-foreground">
							{dataset.splits.join(", ")}
						</span>
					</p>
					<p>
						Source:{" "}
						<span className="font-medium text-foreground">
							{dataset.datasetSource}
						</span>
					</p>
					<p>
						Subset:{" "}
						<span className="font-medium text-foreground">
							{dataset.datasetSubset}
						</span>
					</p>
				</CardContent>
			</Card>
		</Link>
	);
};

export default DatasetCard;
