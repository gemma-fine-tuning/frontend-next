import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function GET(
	request: Request,
	context: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await context.params;

		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/jobs/${jobId}`,
		);
		if (!res.ok) {
			const errorData = await res.json();
			return NextResponse.json(
				{ error: errorData.error || "Failed to fetch job status" },
				{ status: res.status },
			);
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to fetch job:", error);
		return NextResponse.json(
			{ error: "Could not fetch job." },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	context: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await context.params;

		const response = await backendFetch(
			request,
			`${API_GATEWAY_URL}/jobs/${jobId}`,
			{
				method: "DELETE",
			},
		);

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(
				{ error: errorData.error || "Failed to delete job" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to delete job:", error);
		return NextResponse.json(
			{ error: "Could not delete job." },
			{ status: 500 },
		);
	}
}
