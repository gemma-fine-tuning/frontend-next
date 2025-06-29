import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { dataset_id } = await request.json();

		if (!dataset_id) {
			return NextResponse.json(
				{ error: "Dataset ID is required" },
				{ status: 400 },
			);
		}

		const response = await fetch(
			`https://datasets-server.huggingface.co/splits?dataset=${dataset_id}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.HF_TOKEN}`,
				},
				method: "GET",
			},
		);

		const data = await response.json();

		if (data.error) {
			return NextResponse.json({ error: data.error }, { status: 400 });
		}

		const uniqueConfigs = [
			...new Set(
				data.splits.map((split: { config: string }) => split.config),
			),
		];

		return NextResponse.json({ configs: uniqueConfigs });
	} catch (error) {
		console.error("Error processing dataset:", error);
		console.error("Error processing dataset:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
