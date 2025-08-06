export interface EvaluationMetrics {
	accuracy?: number;
	perplexity?: number;
	eval_loss?: number;
	eval_runtime?: number;
}

export interface TrainingJob {
	job_id: string;
	job_name?: string;
	status?: "queued" | "preparing" | "training" | "completed" | "failed";
	processed_dataset_id?: string;
	base_model_id?: string;
	created_at?: string;
	wandb_url?: string;
	adapter_path?: string;
	gguf_path?: string;
	error?: string;
	modality?: "text" | "vision";
	metrics?: EvaluationMetrics;
}

export interface BatchInferenceResult {
	results: string[];
}

export interface InferenceResult {
	result: string;
}

export interface JobDeleteResponse {
	job_id: string;
	deleted: boolean;
	message: string;
	deleted_resources?: string[];
}
