import { backendFetch } from "@/app/api/utils";
import { NextResponse } from "next/server";
import { TRAIN_SERVICE_URL } from "../../../env";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await params;

		// Call the backend training service
		const backendUrl = `${TRAIN_SERVICE_URL}/jobs/${jobId}/delete`;

		const response = await backendFetch(request, backendUrl, {
			method: "DELETE",
		});
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to delete job" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to delete job:", error);
		return NextResponse.json(
			{ error: "Could not delete job." },
			{ status: 500 },
		);
	}
}
