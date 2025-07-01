import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { dataset_id, config } = await request.json();

		if (!dataset_id || !config) {
			return NextResponse.json(
				{ error: "Dataset ID and config are required" },
				{ status: 400 },
			);
		}

		const response = await fetch(
			`https://datasets-server.huggingface.co/info?dataset=${dataset_id}&config=${config}`,
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

		// Extract only the required information
		const { splits } = data.dataset_info;

		// Process splits to only include name and num_examples
		const processedSplits = Object.keys(splits).reduce(
			(acc, splitName) => {
				acc[splitName] = {
					name: splits[splitName].name,
					num_examples: splits[splitName].num_examples,
				};
				return acc;
			},
			{} as Record<string, { name: string; num_examples: number }>,
		);

		return NextResponse.json({
			splits: processedSplits,
		});
	} catch (error) {
		console.error("Error fetching dataset information:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
