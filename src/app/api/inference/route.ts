import type { InferenceRequest, InferenceResponse } from "@/types/inference";
import { NextResponse } from "next/server";
import { HF_TOKEN, INFERENCE_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { adapter_path, base_model_id, prompt } =
			body as Partial<InferenceRequest>;

		if (!adapter_path || !base_model_id || !prompt) {
			return NextResponse.json(
				{
					error: "adapter_path, base_model_id, and prompt are required",
				},
				{ status: 400 },
			);
		}

		const res = await backendFetch(
			request,
			`${INFERENCE_SERVICE_URL}/inference`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					hf_token: HF_TOKEN,
					adapter_path,
					base_model_id,
					prompt,
				}),
			},
		);

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || "Inference failed");
		return NextResponse.json(data as InferenceResponse);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
