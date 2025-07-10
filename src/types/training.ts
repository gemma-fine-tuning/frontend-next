export interface TrainingJob {
	job_id: string;
	job_name?: string;
	status?: string;
	processed_dataset_id?: string;
	base_model_id?: string;
	created_at?: string;
	wandb_url?: string;
	adapter_path?: string;
	error?: string;
}

export interface BatchInferenceResult {
	results: string[];
}

export interface InferenceResult {
	result: string;
}
