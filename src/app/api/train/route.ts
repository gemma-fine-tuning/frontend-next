import { NextResponse } from "next/server";
import { API_GATEWAY_URL, HF_TOKEN } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Inject HF_TOKEN if not provided
		const requestBody = {
			...body,
			hf_token: body.hf_token || HF_TOKEN,
		};

		const response = await backendFetch(
			request,
			`${API_GATEWAY_URL}/train`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			},
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to start training job" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to start training job:", error);
		return NextResponse.json(
			{ error: "Could not start training job." },
			{ status: 500 },
		);
	}
}
