import { NextResponse } from "next/server";
import { HF_TOKEN } from "../../../env";

async function fetchAsBase64(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}
	const buffer = await response.arrayBuffer();
	const contentType = response.headers.get("content-type") || "image/jpeg";
	return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
}

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

		// Process rows to fetch and convert images to base64
		for (const row of top5Rows) {
			for (const key in row.row) {
				if (
					row.row[key] &&
					typeof row.row[key] === "object" &&
					row.row[key].src
				) {
					try {
						// fetch the image here and return base64 to avoid link expiration
						row.row[key].src = await fetchAsBase64(
							row.row[key].src,
						);
					} catch (e) {
						console.error(`Failed to fetch image for ${key}:`, e);
						// Optionally, you can remove the image or set a placeholder
						row.row[key] = { error: "Failed to load image" };
					}
				}
			}
		}

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
