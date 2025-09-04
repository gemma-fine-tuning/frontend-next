import type { DatasetMessage } from "./dataset";

// Single inference request/response
export interface InferenceRequest {
	adapter_path: string;
	base_model_id: string;
	prompt: string;
}

export interface InferenceResponse {
	result: string;
}

// Batch inference request/response
export interface BatchInferenceRequest {
	adapter_path: string;
	base_model_id: string;
	messages: Array<Array<DatasetMessage>>;
}

export interface BatchInferenceResponse {
	results: string[];
}

// Evaluation request/response (moved from training types)
export type TaskType =
	| "conversation"
	| "qa"
	| "summarization"
	| "translation"
	| "classification"
	| "general";

export type MetricType =
	| "rouge"
	| "bertscore"
	| "accuracy"
	| "exact_match"
	| "bleu"
	| "meteor"
	| "recall"
	| "precision"
	| "f1";

export interface EvaluationRequest {
	adapter_path: string;
	base_model_id: string;
	dataset_id: string;
	task_type?: TaskType;
	metrics?: MetricType[];
	max_samples?: number;
	num_sample_results?: number;
	hf_token?: string;
}

export interface SampleResult {
	prediction: string;
	reference: string;
	sample_index: number;
	input?: Array<DatasetMessage>;
}

export interface EvaluationResponse {
	metrics: Record<string, number | Record<string, number>>;
	num_samples: number;
	dataset_id: string;
	samples: SampleResult[];
}

export interface ApiErrorResponse {
	error: string;
}
