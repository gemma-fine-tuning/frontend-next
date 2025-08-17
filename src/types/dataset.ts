export interface TextContentPart {
	type: "text";
	text: string;
}

export interface ImageContentPart {
	type: "image";
	image: string;
}

export type MessageContent = string | (TextContentPart | ImageContentPart)[];

export interface DatasetMessage {
	content: MessageContent;
	role: "system" | "user" | "assistant";
}

export interface DatasetSample {
	messages?: DatasetMessage[];
	// For prompt-only mode
	prompt?: DatasetMessage[];
	// For preference mode
	chosen?: DatasetMessage[];
	rejected?: DatasetMessage[];
	[key: string]: unknown; // Additional dynamic fields based on user field mappings (strings only)
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
	processed_dataset_id: string;
	dataset_source: "upload" | "huggingface";
	dataset_id: string;
	created_at: string;
	modality: "text" | "vision";
	splits: DatasetSplit[];
}

export interface DatasetDetailState {
	data: DatasetDetail | null;
	loading: boolean;
	error: string | null;
}

export interface FieldMapping {
	type: "template" | "column" | "image";
	value: string;
}

export interface UserFieldMapping extends FieldMapping {
	type: "template" | "column" | "image";
	value: string;
}

export interface FieldMappings {
	[key: string]: FieldMapping;
}

export interface VisionConfig {
	vision_enabled: boolean;
	field_mappings: FieldMappings;
}

export interface DatasetDeleteResponse {
	dataset_name: string;
	deleted: boolean;
	message: string;
	deleted_files_count?: number;
	deleted_resources?: string[];
}
