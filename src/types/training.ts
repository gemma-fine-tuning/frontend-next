export interface EvaluationMetrics {
	accuracy?: number;
	perplexity?: number;
	eval_loss?: number;
	eval_runtime?: number;
}

// New structured config types based on backend schema
export interface RewardConfig {
	built_in_func: string[];
}

export interface HyperparameterConfig {
	// Basic hyperparameters
	learning_rate: number;
	batch_size: number;
	gradient_accumulation_steps: number;
	epochs: number;
	max_steps?: number;

	// Technical and optimization settings
	packing: boolean;
	use_fa2: boolean;
	max_seq_length?: number;
	lr_scheduler_type?: string;
	save_strategy?: string;
	logging_steps?: number;

	// PEFT Config
	lora_rank?: number;
	lora_alpha?: number;
	lora_dropout?: number;

	// GRPO-specific hyperparameters
	num_generations?: number;
	max_prompt_length?: number;
	max_grad_norm?: number;
	adam_beta1?: number;
	adam_beta2?: number;
	warmup_ratio?: number;

	// DPO-specific hyperparameters
	beta?: number;
	max_length?: number;
}

export interface EvaluationConfig {
	eval_strategy?: "no" | "steps" | "epoch";
	eval_steps?: number;
	compute_eval_metrics?: boolean;
	batch_eval_metrics?: boolean;
}

export interface WandbConfig {
	api_key: string;
	project?: string;
	log_model?: "false" | "checkpoint" | "end";
}

export interface ExportConfig {
	format: "adapter" | "merged";
	destination: "gcs" | "hfhub";
	hf_repo_id?: string;
	include_gguf?: boolean;
	gguf_quantization?: "none" | "f16" | "bf16" | "q8_0" | "q4_k_m";
}

export interface TrainingConfig {
	base_model_id: string;
	provider: "unsloth" | "huggingface";
	method: "Full" | "LoRA" | "QLoRA";
	trainer_type: "sft" | "dpo" | "grpo";
	modality: "text" | "vision";

	hyperparameters: HyperparameterConfig;
	export_config: ExportConfig;
	eval_config?: EvaluationConfig;
	wandb_config?: WandbConfig;
	reward_config?: RewardConfig;
}

export interface TrainRequest {
	processed_dataset_id: string;
	hf_token: string;
	job_name: string;
	training_config: TrainingConfig;
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
