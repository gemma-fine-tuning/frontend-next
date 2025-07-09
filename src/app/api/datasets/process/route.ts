import { NextResponse } from "next/server";

const BACKEND_URL =
	process.env.PREPROCESS_SERVICE_URL || "http://localhost:8080";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const res = await fetch(`${BACKEND_URL}/process`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await res.json();
		if (!res.ok)
			throw new Error(data.detail || "Failed to process dataset");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
