import { NextResponse } from "next/server";
import { PREPROCESS_SERVICE_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const res = await backendFetch(
			request,
			`${PREPROCESS_SERVICE_URL}/process`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			},
		);
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
