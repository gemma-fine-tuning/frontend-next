import { NextResponse } from "next/server";
import { PREPROCESS_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

export async function GET(request: Request) {
	try {
		const res = await backendFetch(
			request,
			`${PREPROCESS_SERVICE_URL}/datasets`,
		);
		if (!res.ok) throw new Error("Failed to fetch datasets");
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{
				datasets: [],
				error: err instanceof Error ? err.message : String(err),
			},
			{ status: 500 },
		);
	}
}
