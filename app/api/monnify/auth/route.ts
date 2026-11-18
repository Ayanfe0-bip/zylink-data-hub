import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  const baseUrl = process.env.MONNIFY_BASE_URL;

  if (!apiKey || !secretKey || !baseUrl) {
    return NextResponse.json(
      {
        ok: false,
        message: "Monnify credentials are not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const credentials = Buffer.from(
      `${apiKey}:${secretKey}`
    ).toString("base64");

    const response = await fetch(
      `${baseUrl}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.requestSuccessful) {
      return NextResponse.json(
        {
          ok: false,
          message: "Monnify authentication failed.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Monnify authentication successful.",
      environment: "Sandbox",
    });

  } catch (error) {
    console.error("Monnify authentication error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Unable to connect to Monnify.",
      },
      { status: 502 }
    );
  }
}
