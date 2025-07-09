import { NextResponse } from "next/server";

const BACKEND_URL =
	process.env.TRAIN_SERVICE_URL ||
	"https://training-service-10987549752.us-central1.run.app";

export async function GET(
	request: Request,
	context: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await context.params;
		const res = await fetch(`${BACKEND_URL}/jobs/${jobId}/status`);
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
