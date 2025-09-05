import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	try {
		const requestBody = await request.json();

		const hf_token = requestBody.hf_token;

		if (!hf_token) {
			return NextResponse.json(
				{ error: "HuggingFace API Key is required." },
				{ status: 400 },
			);
		}

		console.log(JSON.stringify(requestBody, null, 2));

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
