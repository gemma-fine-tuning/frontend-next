import { NextResponse } from "next/server";

const BACKEND_URL =
	process.env.INFERENCE_SERVICE_URL ||
	"https://inference-service-10987549752.us-central1.run.app";

// This only works for single inference for now! See issue for new feature to add batch!
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { job_id_or_repo_id, prompt, storage_type } = body;

		// Prefill hf_token from env if not provided
		const hf_token = body.hf_token || process.env.HF_TOKEN;
		if (!job_id_or_repo_id || !prompt || !storage_type || !hf_token) {
			return NextResponse.json(
				{
					error: "job_id_or_repo_id, prompt, storage_type, and hf_token are required",
				},
				{ status: 400 },
			);
		}

		const res = await fetch(`${BACKEND_URL}/inference`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				job_id_or_repo_id,
				prompt,
				hf_token,
				storage_type,
			}),
		});

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || "Inference failed");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
