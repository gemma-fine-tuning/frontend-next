"use client";

import { trainingConfigAtom } from "@/atoms";
import type {
	AnyGraderConfig,
	BuiltInRewardConfig,
	ScoreModelRewardConfig,
	StringCheckRewardConfig,
	TextSimilarityRewardConfig,
} from "@/types/training";
import { useAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const Field = ({
	id,
	label,
	children,
}: {
	id: string;
	label: string;
	children: React.ReactNode;
}) => (
	<div className="space-y-1">
		<Label htmlFor={id}>{label}</Label>
		{children}
	</div>
);

const GraderConfigCard = ({
	grader,
	index,
	onUpdate,
	onRemove,
}: {
	grader: AnyGraderConfig;
	index: number;
	onUpdate: (
		index: number,
		updateFn: (g: AnyGraderConfig) => AnyGraderConfig,
	) => void;
	onRemove: (index: number) => void;
}) => {
	const handleUpdate = (
		updateFn: (g: AnyGraderConfig) => AnyGraderConfig,
	) => {
		onUpdate(index, updateFn);
	};

	const renderGraderForm = () => {
		const idPrefix = `${grader.type}-${index}`;

		switch (grader.type) {
			case "string_check": {
				const referenceFieldId = `${idPrefix}-reference_field`;
				const operationId = `${idPrefix}-operation`;
				return (
					<>
						<Field id={referenceFieldId} label="Reference Field">
							<Input
								id={referenceFieldId}
								value={grader.reference_field}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										reference_field: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={operationId} label="Operation">
							<select
								id={operationId}
								value={grader.operation}
								onChange={e =>
									handleUpdate(g => {
										const scg =
											g as StringCheckRewardConfig;
										return {
											...scg,
											operation: e.target
												.value as StringCheckRewardConfig["operation"],
										};
									})
								}
								className="w-full p-2 border rounded"
							>
								<option value="eq">Equals</option>
								<option value="ne">Not Equals</option>
								<option value="like">Like</option>
								<option value="ilike">iLike</option>
							</select>
						</Field>
					</>
				);
			}
			case "text_similarity": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const referenceFieldId = `${idPrefix}-reference_field`;
				const evaluationMetricId = `${idPrefix}-evaluation_metric`;
				const embeddingModelId = `${idPrefix}-embedding_model`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={referenceFieldId} label="Reference Field">
							<Input
								id={referenceFieldId}
								value={grader.reference_field}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										reference_field: e.target.value,
									}))
								}
							/>
						</Field>
						<Field
							id={evaluationMetricId}
							label="Evaluation Metric"
						>
							<select
								id={evaluationMetricId}
								value={grader.evaluation_metric}
								onChange={e =>
									handleUpdate(g => {
										const tsg =
											g as TextSimilarityRewardConfig;
										return {
											...tsg,
											evaluation_metric: e.target
												.value as TextSimilarityRewardConfig["evaluation_metric"],
										};
									})
								}
								className="w-full p-2 border rounded"
							>
								{[
									"fuzzy_match",
									"bleu",
									"gleu",
									"meteor",
									"cosine",
									"rouge_1",
									"rouge_2",
									"rouge_3",
									"rouge_4",
									"rouge_5",
									"rouge_l",
								].map(m => (
									<option key={m} value={m}>
										{m}
									</option>
								))}
							</select>
						</Field>
						<Field id={embeddingModelId} label="Embedding Model">
							<Input
								id={embeddingModelId}
								value={grader.embedding_model || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,

										embedding_model: e.target.value,
									}))
								}
							/>
						</Field>
					</>
				);
			}
			case "score_model": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const modelId = `${idPrefix}-model`;
				const promptId = `${idPrefix}-prompt`;
				const rangeId = `${idPrefix}-range`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={modelId} label="Model">
							<Input
								id={modelId}
								value={grader.model}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										model: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={promptId} label="Prompt">
							<Textarea
								id={promptId}
								value={grader.prompt}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										prompt: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={rangeId} label="Score Range">
							<div className="flex gap-2">
								<Input
									type="number"
									placeholder="Min"
									value={grader.range?.[0] ?? ""}
									onChange={e =>
										handleUpdate(g => {
											const smg =
												g as ScoreModelRewardConfig;
											return {
												...smg,
												range: [
													Number(e.target.value),
													smg.range?.[1] ?? 1,
												],
											};
										})
									}
								/>
								<Input
									type="number"
									placeholder="Max"
									value={grader.range?.[1] ?? ""}
									onChange={e =>
										handleUpdate(g => {
											const smg =
												g as ScoreModelRewardConfig;
											return {
												...smg,
												range: [
													smg.range?.[0] ?? 0,
													Number(e.target.value),
												],
											};
										})
									}
								/>
							</div>
						</Field>
					</>
				);
			}
			case "label_model": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const modelId = `${idPrefix}-model`;
				const promptId = `${idPrefix}-prompt`;
				const labelsId = `${idPrefix}-labels`;
				const passingLabelsId = `${idPrefix}-passing_labels`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={modelId} label="Model">
							<Input
								id={modelId}
								value={grader.model}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										model: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={promptId} label="Prompt">
							<Textarea
								id={promptId}
								value={grader.prompt}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										prompt: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={labelsId} label="Labels (comma-separated)">
							<Input
								id={labelsId}
								value={grader.labels.join(",")}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										labels: e.target.value
											.split(",")
											.map(s => s.trim()),
									}))
								}
							/>
						</Field>
						<Field
							id={passingLabelsId}
							label="Passing Labels (comma-separated)"
						>
							<Input
								id={passingLabelsId}
								value={grader.passing_labels.join(",")}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										passing_labels: e.target.value
											.split(",")
											.map(s => s.trim()),
									}))
								}
							/>
						</Field>
					</>
				);
			}
			case "python": {
				const sourceId = `${idPrefix}-source`;
				return (
					<Field id={sourceId} label="Python Source Code">
						<Textarea
							id={sourceId}
							value={grader.source}
							onChange={e =>
								handleUpdate(g => ({
									...g,
									source: e.target.value,
								}))
							}
							rows={10}
							className="font-mono"
						/>
					</Field>
				);
			}
			case "built_in": {
				const builtInGrader = grader as BuiltInRewardConfig;
				const functionNameId = `${idPrefix}-function_name`;
				const thinkTagId = `${idPrefix}-think_tag`;
				const answerTagId = `${idPrefix}-answer_tag`;
				return (
					<>
						<Field id={functionNameId} label="Function Name">
							<select
								id={functionNameId}
								value={builtInGrader.function_name}
								onChange={e =>
									handleUpdate(g => {
										const big = g as BuiltInRewardConfig;
										return {
											...big,
											function_name: e.target
												.value as BuiltInRewardConfig["function_name"],
										};
									})
								}
								className="w-full p-2 border rounded"
							>
								{[
									"format_reward",
									"count_xml",
									"expression_accuracy",
									"numerical_accuracy",
								].map(f => (
									<option key={f} value={f}>
										{f}
									</option>
								))}
							</select>
						</Field>
						<Field id={thinkTagId} label="Think Tag">
							<Input
								id={thinkTagId}
								value={
									builtInGrader.parameters?.think_tag || ""
								}
								onChange={e =>
									handleUpdate(g => {
										const big = g as BuiltInRewardConfig;
										return {
											...big,
											parameters: {
												...big.parameters,
												think_tag: e.target.value,
											},
										};
									})
								}
							/>
						</Field>
						<Field id={answerTagId} label="Answer Tag">
							<Input
								id={answerTagId}
								value={
									builtInGrader.parameters?.answer_tag || ""
								}
								onChange={e =>
									handleUpdate(g => {
										const big = g as BuiltInRewardConfig;
										return {
											...big,
											parameters: {
												...big.parameters,
												answer_tag: e.target.value,
											},
										};
									})
								}
							/>
						</Field>
					</>
				);
			}
			case "ruler": {
				const geminiApiKeyId = `${idPrefix}-gemini_api_key`;
				const modelId = `${idPrefix}-model`;
				const rulesId = `${idPrefix}-rules`;
				return (
					<>
						<Field
							id={geminiApiKeyId}
							label="Gemini API Key (Optional)"
						>
							<Input
								id={geminiApiKeyId}
								type="password"
								value={grader.gemini_api_key || ""}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										gemini_api_key: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={modelId} label="Model">
							<Input
								id={modelId}
								value={grader.model}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										model: e.target.value,
									}))
								}
							/>
						</Field>
						<Field id={rulesId} label="Rules (one per line)">
							<Textarea
								id={rulesId}
								value={grader.rules.join("\n")}
								onChange={e =>
									handleUpdate(g => ({
										...g,
										rules: e.target.value.split("\n"),
									}))
								}
								rows={5}
							/>
						</Field>
					</>
				);
			}
			default:
				return <p>Unknown grader type</p>;
		}
	};

	return (
		<div className="p-4 border rounded-md space-y-4 bg-muted/20">
			<div className="flex justify-between items-center">
				<h4 className="font-semibold capitalize">
					{grader.type.replace(/_/g, " ")} Grader
				</h4>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => onRemove(index)}
				>
					Remove
				</Button>
			</div>
			<div className="grid md:grid-cols-2 gap-4">
				<Field id={`${grader.type}-${index}-name`} label="Unique Name">
					<Input
						id={`${grader.type}-${index}-name`}
						value={grader.name}
						onChange={e =>
							handleUpdate(g => ({ ...g, name: e.target.value }))
						}
					/>
				</Field>
				{renderGraderForm()}
			</div>
		</div>
	);
};

export function RewardConfigurator() {
	const [config, setConfig] = useAtom(trainingConfigAtom);
	const [selectedGraderType, setSelectedGraderType] = useState<
		AnyGraderConfig["type"] | ""
	>("");

	if (!config) return null;

	const createDefaultGrader = (
		type: AnyGraderConfig["type"],
	): AnyGraderConfig => {
		const base = {
			name: `${type}_${(config.reward_config?.length || 0) + 1}`,
		};
		switch (type) {
			case "string_check":
				return {
					...base,
					type: "string_check",
					reference_field: "",
					operation: "eq",
				};
			case "text_similarity":
				return {
					...base,
					type: "text_similarity",
					reference_field: "",
					evaluation_metric: "fuzzy_match",
					embedding_model: "models/embedding-001",
				};
			case "score_model":
				return {
					...base,
					type: "score_model",
					model: "gemini-2.0-flash",
					prompt: "",
					range: [0, 1],
				};
			case "label_model":
				return {
					...base,
					type: "label_model",
					model: "gemini-2.0-flash",
					prompt: "",
					labels: [],
					passing_labels: [],
				};
			case "python":
				return {
					...base,
					type: "python",
					source: "def grade(output, **kwargs):\n    return 1.0",
				};
			case "built_in":
				return {
					...base,
					type: "built_in",
					function_name: "format_reward",
					parameters: {
						think_tag: "reasoning",
						answer_tag: "answer",
					},
				};
			case "ruler":
				return {
					...base,
					type: "ruler",
					model: "gemini-2.0-flash",
					rules: [],
				};
			default:
				throw new Error("Invalid grader type");
		}
	};

	const handleAddGrader = () => {
		if (!selectedGraderType) {
			toast.warning("Please select a grader type to add.");
			return;
		}
		const newGrader = createDefaultGrader(selectedGraderType);
		setConfig(prev => {
			if (!prev) return null;
			const existingNames = prev.reward_config?.map(g => g.name) || [];
			let newName = newGrader.name;
			let i = 1;
			while (existingNames.includes(newName)) {
				newName = `${selectedGraderType}_${
					(prev.reward_config?.length || 0) + i
				}`;
				i++;
			}
			newGrader.name = newName;
			return {
				...prev,
				reward_config: [...(prev.reward_config || []), newGrader],
			};
		});
		setSelectedGraderType("");
	};

	const handleRemoveGrader = (index: number) => {
		setConfig(prev => {
			if (!prev || !prev.reward_config) return prev;
			const newRewards = prev.reward_config.filter((_, i) => i !== index);
			return {
				...prev,
				reward_config: newRewards.length > 0 ? newRewards : undefined,
			};
		});
	};

	const updateGrader = (
		index: number,
		updateFn: (grader: AnyGraderConfig) => AnyGraderConfig,
	) => {
		setConfig(prev => {
			if (!prev || !prev.reward_config) return prev;
			const newRewards = prev.reward_config.map((grader, i) =>
				i === index ? updateFn(grader) : grader,
			);
			return { ...prev, reward_config: newRewards };
		});
	};

	return (
		<div className="space-y-4 py-4">
			<p className="text-sm text-muted-foreground">
				Configure one or more reward functions (graders) for GRPO
				training.
			</p>
			<div className="space-y-4">
				{config.reward_config?.map((grader, index) => (
					<GraderConfigCard
						key={grader.name}
						grader={grader}
						index={index}
						onUpdate={updateGrader}
						onRemove={handleRemoveGrader}
					/>
				))}
			</div>
			<div className="flex items-center gap-2 pt-4">
				<select
					value={selectedGraderType}
					onChange={e =>
						setSelectedGraderType(
							e.target.value as AnyGraderConfig["type"] | "",
						)
					}
					className="w-full p-2 border rounded"
				>
					<option value="">Select Grader Type to Add</option>
					<option value="built_in">Built-in Reward Functions</option>
					<option value="string_check">String Check</option>
					<option value="text_similarity">Text Similarity</option>
					<option value="score_model">Score Model</option>
					<option value="label_model">Label Model</option>
					<option value="python">
						Custom Python Reward Functions
					</option>
					<option value="ruler">Ruler</option>
				</select>
				<Button onClick={handleAddGrader}>Add Grader</Button>
			</div>
		</div>
	);
}
