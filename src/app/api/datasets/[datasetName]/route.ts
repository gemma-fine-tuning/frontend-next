import { NextResponse } from "next/server";

const BACKEND_URL =
	process.env.PREPROCESS_SERVICE_URL || "http://localhost:8080";

export async function GET(
	request: Request,
	context: { params: Promise<{ datasetName: string }> },
) {
	try {
		const { datasetName } = await context.params;
		const res = await fetch(
			`${BACKEND_URL}/datasets/${encodeURIComponent(datasetName)}`,
		);
		if (!res.ok) throw new Error("Failed to fetch dataset detail");
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
