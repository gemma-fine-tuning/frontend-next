import { NextResponse } from "next/server";
import { API_GATEWAY_URL, HF_TOKEN } from "../env";
import { backendFetch } from "../utils";

export async function GET(request: Request) {
	try {
		const res = await backendFetch(request, `${API_GATEWAY_URL}/jobs`);
		if (!res.ok) throw new Error("Failed to fetch jobs");
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{
				jobs: [],
				error: err instanceof Error ? err.message : String(err),
			},
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Inject HF_TOKEN from env if not provided
		const hf_token = body.hf_token || HF_TOKEN;
		const payload = { ...body, hf_token };

		const res = await backendFetch(request, `${API_GATEWAY_URL}/train`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) throw new Error("Failed to submit job");
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
