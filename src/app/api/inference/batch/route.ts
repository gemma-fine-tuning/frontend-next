import { NextResponse } from "next/server";
import { HF_TOKEN, INFERENCE_SERVICE_URL } from "../../env";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { job_id_or_repo_id, prompts, storage_type } = body;

		// Prefill hf_token from env if not provided
		const hf_token = body.hf_token || HF_TOKEN;
		if (
			!job_id_or_repo_id ||
			!Array.isArray(prompts) ||
			prompts.length === 0 ||
			!storage_type ||
			!hf_token
		) {
			return NextResponse.json(
				{
					error: "job_id_or_repo_id, prompts (array), storage_type, and hf_token are required",
				},
				{ status: 400 },
			);
		}

		const res = await fetch(`${INFERENCE_SERVICE_URL}/batch_inference`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				job_id_or_repo_id,
				prompts,
				storage_type,
				hf_token,
			}),
		});

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || "Batch inference failed");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
