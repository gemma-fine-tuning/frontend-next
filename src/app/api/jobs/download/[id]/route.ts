import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../../env";
import { backendFetch } from "../../../utils";

// NOTE: This is not used for now!
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await params;

		// Call the backend API gateway
		const backendUrl = `${API_GATEWAY_URL}/jobs/download/${jobId}`;

		const response = await backendFetch(request, backendUrl);
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
