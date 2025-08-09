import { backendFetch } from "@/app/api/utils";
import { NextResponse } from "next/server";
import { PREPROCESS_SERVICE_URL } from "../../../env";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ datasetName: string }> },
) {
	try {
		const { datasetName } = await params;

		// Call the backend preprocessing service
		const backendUrl = `${PREPROCESS_SERVICE_URL}/datasets/${datasetName}/delete`;

		const response = await backendFetch(request, backendUrl, {
			method: "DELETE",
		});
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to delete dataset" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to delete dataset:", error);
		return NextResponse.json(
			{ error: "Could not delete dataset." },
			{ status: 500 },
		);
	}
}
