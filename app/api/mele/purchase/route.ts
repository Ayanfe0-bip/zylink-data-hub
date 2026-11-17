import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  MELE_DATA_PLANS,
  NetworkCode,
} from "@/lib/mele-data-plans";

const NETWORK_CODES: Record<NetworkCode, number> = {
  MTN: 1,
  GLO: 2,
  "9MOBILE": 3,
  AIRTEL: 4,
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.MELE_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, message: "MELE DATA API key is missing." },
        { status: 500 }
      );
    }

    // Keep all purchases in test mode for now.
    if (!apiKey.startsWith("mele_test_")) {
      return NextResponse.json(
        {
          ok: false,
          message: "Live purchases are disabled during testing.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const network = String(body.network || "").toUpperCase() as NetworkCode;
    const planId = Number(body.planId);
    const phoneInput = String(body.phone || "").replace(/\s+/g, "");

    if (!["MTN", "AIRTEL", "GLO", "9MOBILE"].includes(network)) {
      return NextResponse.json(
        { ok: false, message: "Invalid network selected." },
        { status: 400 }
      );
    }

    let phone = phoneInput;

    if (/^234\d{10}$/.test(phone)) {
      phone = "0" + phone.slice(3);
    }

    if (!/^0\d{10}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid 11-digit Nigerian phone number." },
        { status: 400 }
      );
    }

    const selectedPlan = MELE_DATA_PLANS.find(
      (plan) =>
        plan.planId === planId &&
        plan.network === network
    );

    if (!selectedPlan) {
      return NextResponse.json(
        { ok: false, message: "The selected data plan is invalid." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.meledata.ng/api/v1/developer/data",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          plan: selectedPlan.planId,
          network: NETWORK_CODES[network],
          "request-id": `zylink-${randomUUID()}`,
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          provider: "MELE DATA",
          message: result.message || "The provider could not process this request.",
          details: result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: "MELE DATA",
      mode: "test",
      plan: selectedPlan.name,
      network,
      phone,
      providerPrice: selectedPlan.providerPrice,
      result,
    });
  } catch (error) {
    console.error("Zylink purchase error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Unable to process the purchase request.",
      },
      { status: 500 }
    );
  }
}
