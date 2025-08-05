import { NextResponse } from "next/server";
import { TRAIN_SERVICE_URL } from "../../../../env";

export async function GET(
	request: Request,
	{ params }: { params: { jobId: string } },
) {
	try {
		const { jobId } = params;

		// Call the backend training service
		const backendUrl = `${TRAIN_SERVICE_URL}/jobs/${jobId}/download/gguf`;

		const response = await fetch(backendUrl);
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to get download URL" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to get GGUF download URL:", error);
		return NextResponse.json(
			{ error: "Could not get download link." },
			{ status: 500 },
		);
	}
}
