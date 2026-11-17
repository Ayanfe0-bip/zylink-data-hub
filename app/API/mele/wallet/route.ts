import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.MELE_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "MELE DATA API key is not configured."
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      "https://api.meledata.ng/api/v1/developer/user",
      {
        method: "GET",
        headers: {
          Authorization: `Token ${apiKey}`,
          Accept: "application/json"
        },
        cache: "no-store"
      }
    );

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "MELE DATA wallet request failed.",
          providerStatus: response.status,
          details: payload
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: "MELE DATA",
      data: payload
    });

  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Could not connect to MELE DATA."
      },
      { status: 502 }
    );
  }
}
