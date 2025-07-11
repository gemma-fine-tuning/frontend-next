import { NextResponse } from "next/server";
import { HF_TOKEN, TRAIN_SERVICE_URL } from "../env";

export async function GET() {
	try {
		const res = await fetch(`${TRAIN_SERVICE_URL}/jobs`);
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

		const res = await fetch(`${TRAIN_SERVICE_URL}/train`, {
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
