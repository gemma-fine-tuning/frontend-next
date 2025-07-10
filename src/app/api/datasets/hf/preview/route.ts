import { NextResponse } from "next/server";
import { HF_TOKEN } from "../../../env";

export async function POST(request: Request) {
	try {
		const { dataset_id, config, split } = await request.json();

		if (!dataset_id || !config || !split) {
			return NextResponse.json(
				{ error: "Dataset ID, config, and split are required" },
				{ status: 400 },
			);
		}

		const response = await fetch(
			`https://datasets-server.huggingface.co/first-rows?dataset=${dataset_id}&config=${config}&split=${split}`,
			{
				headers: {
					Authorization: `Bearer ${HF_TOKEN}`,
				},
				method: "GET",
			},
		);

		const data = await response.json();

		if (data.error) {
			return NextResponse.json({ error: data.error }, { status: 400 });
		}

		// Get only the first 5 rows
		const top5Rows = data.rows.slice(0, 5);

		const columns = [];
		for (const feature of data.features) {
			columns.push(feature.name);
		}

		return NextResponse.json({
			dataset: data.dataset,
			config: data.config,
			split: data.split,
			rows: top5Rows,
			columns: columns,
		});
	} catch (error) {
		console.error("Error fetching dataset preview:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
