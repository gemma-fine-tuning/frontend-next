import {
	datasetSelectionAtom,
	localDatasetAtom,
	localDatasetColumnsAtom,
	localDatasetIdAtom,
	localDatasetPreviewLoadingAtom,
	localDatasetPreviewRowsAtom,
	localDatasetSizeAtom,
} from "@/atoms";
import { useAtom } from "jotai";
import { Loader2, Settings, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DatasetPreview from "./dataset-preview";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const LocalDatasetSelector = () => {
	const [localDataset, setLocalDataset] = useAtom(localDatasetAtom);
	const [localDatasetPreviewLoading, setLocalDatasetPreviewLoading] = useAtom(
		localDatasetPreviewLoadingAtom,
	);
	const [localDatasetId, setLocalDatasetId] = useAtom(localDatasetIdAtom);
	const [localDatasetPreviewRows, setLocalDatasetPreviewRows] = useAtom(
		localDatasetPreviewRowsAtom,
	);
	const [localDatasetColumns, setLocalDatasetColumns] = useAtom(
		localDatasetColumnsAtom,
	);
	const [localDatasetSize, setLocalDatasetSize] =
		useAtom(localDatasetSizeAtom);
	const [datasetSelection, setDatasetSelection] =
		useAtom(datasetSelectionAtom);
	const router = useRouter();

	const handleLocalDatasetUpload = async () => {
		if (!localDataset) {
			toast.error("Please upload a dataset first");
			return;
		}

		setLocalDatasetPreviewLoading(true);
		setLocalDatasetId("");
		setLocalDatasetPreviewRows([]);
		try {
			const formData = new FormData();
			formData.append("file", localDataset);

			const response = await fetch("http://127.0.0.1:8000/upload", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();

			setLocalDatasetId(data.dataset_id);
			setLocalDatasetPreviewRows(
				data.sample.map((item: Record<string, string>) => ({
					row: item,
				})),
			);
			setLocalDatasetColumns(data.columns);
			setLocalDatasetSize(data.size);
		} catch (error) {
			console.error("Error uploading file:", error);
			toast.error("Failed to upload dataset");
		} finally {
			setLocalDatasetPreviewLoading(false);
		}
	};

	return (
		<div className="space-y-6 mt-6">
			<Card>
				<CardHeader>
					<CardTitle>Local Dataset</CardTitle>
					<CardDescription>
						Upload a local dataset to preprocess it for finetuning.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex gap-2 items-end">
					<div className="space-y-3 w-full">
						<Label htmlFor="localDataset">Local Dataset</Label>
						<Input
							type="file"
							accept=".csv, .json, .jsonl, .parquet, .xlsx, .xls"
							onChange={e => {
								const file = e.target.files?.[0];
								if (file) {
									setLocalDataset(file);
								}
							}}
						/>
					</div>
					<Button
						className="cursor-pointer"
						onClick={handleLocalDatasetUpload}
						disabled={!localDataset}
					>
						{localDatasetPreviewLoading ? (
							<Loader2 className="animate-spin" />
						) : (
							<UploadCloud />
						)}
						Upload Dataset
					</Button>
				</CardContent>
			</Card>

			{localDatasetPreviewLoading && (
				<div className="flex items-center gap-2 mt-10 justify-center">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Uploading dataset...</span>
				</div>
			)}

			{localDatasetPreviewRows.length > 0 &&
				!localDatasetPreviewLoading && (
					<DatasetPreview rows={localDatasetPreviewRows} />
				)}

			{localDatasetPreviewRows.length > 0 &&
				!localDatasetPreviewLoading && (
					<Button
						className="cursor-pointer w-full"
						onClick={() => {
							setDatasetSelection({
								type: "local",
								datasetId: localDatasetId,
								rows: localDatasetPreviewRows,
								columns: localDatasetColumns,
								availableSplits: [
									{
										name: "train",
										num_examples: localDatasetSize,
									},
								],
							});

							router.push("/dashboard/datasets/configuration");
						}}
						disabled={
							!localDatasetId ||
							localDatasetPreviewRows.length === 0
						}
					>
						<Settings /> Finalize dataset and proceed to
						configuration
					</Button>
				)}
		</div>
	);
};

export default LocalDatasetSelector;
