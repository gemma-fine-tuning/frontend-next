import { NextResponse } from "next/server";
import { PREPROCESS_SERVICE_URL } from "../../env";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const res = await fetch(`${PREPROCESS_SERVICE_URL}/upload`, {
			method: "POST",
			body: formData,
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.detail || "Failed to upload dataset");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
