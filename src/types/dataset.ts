export interface DatasetMessage {
	content: string;
	role: "system" | "user" | "assistant";
}

export interface DatasetSample {
	messages: DatasetMessage[];
}

export interface DatasetSplit {
	split_name: string;
	num_rows: number;
	path: string;
	samples: DatasetSample[];
}

export interface DatasetDetail {
	dataset_name: string;
	dataset_subset: string;
	dataset_source: "upload" | "huggingface";
	dataset_id: string;
	created_at: string;
	splits: DatasetSplit[];
}

export interface DatasetDetailState {
	data: DatasetDetail | null;
	loading: boolean;
	error: string | null;
}
