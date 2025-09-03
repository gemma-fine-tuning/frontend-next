import type {
	BatchInferenceRequest,
	BatchInferenceResponse,
} from "@/types/inference";
import { NextResponse } from "next/server";
import { HF_TOKEN, INFERENCE_SERVICE_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { adapter_path, base_model_id, messages } =
			body as Partial<BatchInferenceRequest>;

		if (
			!adapter_path ||
			!base_model_id ||
			!Array.isArray(messages) ||
			messages.length === 0
		) {
			return NextResponse.json(
				{
					error: "adapter_path, base_model_id, and messages (array) are required",
				},
				{ status: 400 },
			);
		}

		const res = await backendFetch(
			request,
			`${INFERENCE_SERVICE_URL}/inference/batch`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					hf_token: HF_TOKEN,
					adapter_path,
					base_model_id,
					messages,
				}),
			},
		);

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || "Batch inference failed");
		return NextResponse.json(data as BatchInferenceResponse);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
