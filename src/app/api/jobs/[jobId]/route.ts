import { NextResponse } from "next/server";
import { TRAIN_SERVICE_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function GET(
	request: Request,
	context: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await context.params;

		const res = await backendFetch(
			request,
			`${TRAIN_SERVICE_URL}/jobs/${jobId}/status`,
		);
		if (!res.ok) throw new Error("Failed to fetch job status");
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
