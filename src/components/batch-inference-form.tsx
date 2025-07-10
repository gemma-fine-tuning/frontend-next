import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DatasetDetail } from "@/types/dataset";
import type { BatchInferenceResult, TrainingJob } from "@/types/training";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface BatchInferenceFormProps {
	job: TrainingJob;
	jobId: string;
}

function extractPromptsFromDatasetDetail(detail: DatasetDetail): string[] {
	const prompts: string[] = [];
	for (const split of detail.splits) {
		for (const sample of split.samples) {
			const msgs = sample.messages;
			const userMsg = msgs.find(m => m.role === "user");
			const prompt = userMsg ? userMsg.content : msgs[0]?.content;
			if (prompt) prompts.push(String(prompt));
		}
	}
	return prompts;
}

export default function BatchInferenceForm({
	job,
	jobId,
}: BatchInferenceFormProps) {
	const [dataset, setDataset] = useState<string>(
		job.processed_dataset_id || "",
	);
	const [samples, setSamples] = useState<string[]>([]);
	const [selected, setSelected] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

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

			const prompts = extractPromptsFromDatasetDetail(data);
			if (prompts.length === 0)
				throw new Error("No samples found in dataset");
			setSamples(prompts.slice(0, 5));
			setSelected([]);
			setResults([]);
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
			const res = await fetch("/api/inference/batch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					job_id_or_repo_id: jobId,
					prompts: selected,
					storage_type: job?.adapter_path?.startsWith("gs://")
						? "gcs"
						: "hfhub",
				}),
			});
			const data = (await res.json()) as BatchInferenceResult;
			if (!res.ok) throw new Error("Batch inference failed");
			setResults(data.response);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<label htmlFor="dataset" className="text-sm font-medium">
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
			{error && <div className="text-red-600 text-sm">{error}</div>}
			{samples.length > 0 && (
				<div className="space-y-4">
					<div className="font-semibold">Select prompts (max 5):</div>
					<div className="grid gap-3">
						{samples.map(sample => (
							<label
								key={sample}
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
								<pre className="text-xs whitespace-pre-wrap max-h-36 overflow-auto flex-1">
									{sample}
								</pre>
							</label>
						))}
					</div>
					<Button
						onClick={runBatchInference}
						disabled={selected.length === 0 || loading}
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
						{selected.map(prompt => (
							<li
								key={prompt}
								className="border rounded p-4 space-y-2 bg-muted/50"
							>
								<div>
									<span className="text-xs text-muted-foreground">
										Prompt:
									</span>
									<pre className="bg-input/10 p-2 rounded text-xs whitespace-pre-wrap max-h-40 overflow-auto">
										{prompt}
									</pre>
								</div>
								<div>
									<span className="text-xs text-muted-foreground">
										Result:
									</span>
									<pre className="bg-input/10 p-2 rounded text-xs whitespace-pre-wrap max-h-40 overflow-auto">
										{results[selected.indexOf(prompt)] ||
											"(no result)"}
									</pre>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
