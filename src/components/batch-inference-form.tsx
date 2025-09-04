import { MessageDisplay } from "@/components/message-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
	DatasetDetail,
	DatasetMessage,
	DatasetSample,
	DatasetSplit,
} from "@/types/dataset";
import type { BatchInferenceResponse } from "@/types/inference";
import type { TrainingJob } from "@/types/training";
import { InfoIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BatchInferenceFormProps {
	job: TrainingJob;
}

function getSampleKey(sample: DatasetSample): string {
	try {
		return JSON.stringify(sample.messages || sample.prompt || sample);
	} catch {
		// Fallback for any unexpected circular references, though unlikely with this data structure
		return String(Math.random());
	}
}

function getInferenceMessages(messages: DatasetMessage[]): DatasetMessage[] {
	return messages.filter(m => m.role !== "assistant");
}

function getGroundTruth(
	messages: DatasetMessage[],
): DatasetMessage | undefined {
	return messages.find(m => m.role === "assistant");
}

export default function BatchInferenceForm({ job }: BatchInferenceFormProps) {
	const [dataset, setDataset] = useState<string>(
		job.processed_dataset_id || "",
	);
	const [detail, setDetail] = useState<DatasetDetail | null>(null);
	const [splits, setSplits] = useState<DatasetSplit[]>([]);
	const [selectedSplit, setSelectedSplit] = useState<string>("");
	const [samples, setSamples] = useState<DatasetSample[]>([]);
	const [selected, setSelected] = useState<DatasetSample[]>([]);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [hfToken, setHfToken] = useState<string>("");

	// Detect provider from base model ID
	const baseModelParts = job.base_model_id?.split("/");
	const provider =
		baseModelParts?.[0] === "unsloth" ? "unsloth" : "huggingface";

	// Load HF token from localStorage
	useEffect(() => {
		const storedHfToken =
			typeof window !== "undefined"
				? localStorage.getItem("hfToken")
				: null;
		if (storedHfToken) {
			setHfToken(storedHfToken);
		}
	}, []);

	async function fetchSamples() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/datasets/${encodeURIComponent(dataset)}`,
			);
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || "Failed to fetch dataset");

			const detailData = data as DatasetDetail;
			setDetail(detailData);
			setSplits(detailData.splits);
			if (detailData.splits.length > 0) {
				const first = detailData.splits[0];
				setSelectedSplit(first.split_name);
				// Filter samples to only include language modeling format (with messages)
				const languageModelingSamples = first.samples.filter(
					sample => sample.messages,
				);
				setSamples(languageModelingSamples.slice(0, 5));
				setSelected([]);
				setResults([]);
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	async function runBatchInference() {
		setLoading(true);
		setError(null);
		setResults([]);
		try {
			// Validate HF token for HuggingFace models
			if (provider === "huggingface" && !hfToken) {
				toast.error(
					"HuggingFace token is required for HuggingFace models",
				);
				return;
			}

			const res = await fetch("/api/inference/batch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					adapter_path: job?.adapter_path,
					base_model_id: job?.base_model_id,
					messages: selected.map(s =>
						getInferenceMessages(s.messages || []),
					),
					hf_token: provider === "huggingface" ? hfToken : undefined,
				}),
			});
			const data = (await res.json()) as BatchInferenceResponse;
			if (!res.ok) throw new Error("Batch inference failed");
			setResults(data.results);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2 space-y-4">
				<label htmlFor="dataset" className="font-semibold">
					Dataset Name
				</label>
				<div className="flex gap-2">
					<Input
						id="dataset"
						value={dataset}
						onChange={e => setDataset(e.target.value)}
						placeholder="Enter dataset name..."
						disabled={loading}
						className="flex-1"
					/>
					<Button
						onClick={fetchSamples}
						disabled={!dataset || loading}
					>
						{loading ? (
							<Loader2 className="animate-spin w-4 h-4" />
						) : (
							"Preview"
						)}
					</Button>
				</div>
			</div>
			{provider === "huggingface" && (
				<div className="flex flex-col gap-2">
					<Label htmlFor="hfToken" className="font-semibold">
						HuggingFace Token{" "}
						<Tooltip>
							<TooltipTrigger>
								<InfoIcon size={18} />
							</TooltipTrigger>
							<TooltipContent className="w-xs text-center">
								You can set this token in the{" "}
								<Link
									href="/dashboard/profile"
									className="underline hover:no-underline"
								>
									Profile
								</Link>{" "}
								page so it's saved in your browser for autofill
								or manually enter it here.
							</TooltipContent>
						</Tooltip>
					</Label>
					<Input
						id="hfToken"
						type="password"
						value={hfToken}
						onChange={e => setHfToken(e.target.value)}
						placeholder="Enter your HuggingFace token..."
						disabled={loading}
					/>
				</div>
			)}
			{error && <div className="text-red-600 text-sm">{error}</div>}
			{splits.length > 0 && (
				<div className="flex items-center gap-2">
					<label htmlFor="split" className="font-semibold">
						Split:
					</label>
					<Select
						value={selectedSplit}
						onValueChange={splitName => {
							setSelectedSplit(splitName);
							const split = splits.find(
								s => s.split_name === splitName,
							);
							// Filter samples to only include language modeling format (with messages)
							const languageModelingSamples =
								split?.samples.filter(
									sample => sample.messages,
								) || [];
							setSamples(languageModelingSamples.slice(0, 5));
							setSelected([]);
							setResults([]);
						}}
					>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Select split" />
						</SelectTrigger>
						<SelectContent>
							{splits.map(s => (
								<SelectItem
									key={s.split_name}
									value={s.split_name}
								>
									{s.split_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			{splits.length > 0 && samples.length === 0 && (
				<div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
					<p className="font-medium text-yellow-800">
						No samples available for batch inference
					</p>
					<p className="text-yellow-700 mt-1">
						This dataset appears to be in prompt-only format, which
						doesn't include assistant responses needed for batch
						inference comparison. Batch inference requires datasets
						in language modeling format with complete conversations.
					</p>
				</div>
			)}
			{samples.length > 0 && (
				<div className="space-y-4">
					<div className="font-semibold">Select prompts (max 5)</div>
					<div className="grid gap-3">
						{samples.map(sample => (
							<label
								key={getSampleKey(sample)}
								className="flex items-start gap-2 p-2 border rounded hover:bg-muted/50"
							>
								<input
									type="checkbox"
									className="mt-1"
									checked={selected.includes(sample)}
									onChange={e => {
										if (e.target.checked)
											setSelected(prev => [
												...prev,
												sample,
											]);
										else
											setSelected(prev =>
												prev.filter(s => s !== sample),
											);
									}}
								/>
								<div className="flex-1 space-y-1 text-sm">
									<MessageDisplay
										messages={getInferenceMessages(
											sample.messages || [],
										)}
									/>
								</div>
							</label>
						))}
					</div>
					<Button
						onClick={runBatchInference}
						disabled={
							selected.length === 0 ||
							loading ||
							(provider === "huggingface" && !hfToken.trim())
						}
						className="w-fit"
					>
						{loading ? (
							<Loader2 className="animate-spin w-4 h-4" />
						) : (
							"Run Batch Inference"
						)}
					</Button>
				</div>
			)}
			{selected.length > 0 && results.length > 0 && (
				<div className="space-y-4">
					<div className="font-semibold">Results:</div>
					<ul className="space-y-4">
						{selected.map((sample, index) => {
							const groundTruth = getGroundTruth(
								sample.messages || [],
							);
							return (
								<li
									key={getSampleKey(sample)}
									className="border rounded p-4 space-y-2 bg-muted/50"
								>
									<div>
										<span className="text-xs text-muted-foreground">
											Prompt:
										</span>
										<pre className="bg-input/10 p-2 rounded text-xs whitespace-pre-wrap max-h-40 overflow-auto">
											{JSON.stringify(
												getInferenceMessages(
													sample.messages || [],
												),
												null,
												2,
											)}
										</pre>
									</div>
									<div>
										<span className="text-xs text-muted-foreground">
											Result:
										</span>
										<pre className="bg-input/10 p-2 rounded text-xs whitespace-pre-wrap max-h-40 overflow-auto">
											{results[index] || "(no result)"}
										</pre>
									</div>
									{groundTruth && (
										<div>
											<span className="text-xs text-muted-foreground">
												Ground Truth:
											</span>
											<pre className="bg-input/10 p-2 rounded text-xs whitespace-pre-wrap max-h-40 overflow-auto">
												{JSON.stringify(
													groundTruth.content,
													null,
													2,
												)}
											</pre>
										</div>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
