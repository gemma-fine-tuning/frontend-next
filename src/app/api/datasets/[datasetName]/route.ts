import { NextResponse } from "next/server";
import { PREPROCESS_SERVICE_URL } from "../../env";

export async function GET(
	request: Request,
	context: { params: Promise<{ datasetName: string }> },
) {
	try {
		const { datasetName } = await context.params;
		const res = await fetch(
			`${PREPROCESS_SERVICE_URL}/datasets/${encodeURIComponent(datasetName)}`,
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
