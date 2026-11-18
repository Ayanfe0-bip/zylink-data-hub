import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.MONNIFY_SECRET_KEY;
    const baseUrl = process.env.MONNIFY_BASE_URL;

    if (!secretKey || !baseUrl) {
      return NextResponse.json(
        { ok: false, message: "Payment configuration missing." },
        { status: 500 }
      );
    }

    const rawBody = await request.text();

    const isSandbox = baseUrl.includes("sandbox.monnify.com");

    if (!isSandbox) {
      const signature = request.headers.get("monnify-signature");

      if (!signature) {
        return NextResponse.json(
          { ok: false, message: "Missing payment signature." },
          { status: 401 }
        );
      }

      const expectedSignature = createHmac(
        "sha512",
        secretKey
      )
        .update(rawBody)
        .digest("hex");

      const received = Buffer.from(signature, "hex");
      const expected = Buffer.from(expectedSignature, "hex");

      if (
        received.length !== expected.length ||
        !timingSafeEqual(received, expected)
      ) {
        return NextResponse.json(
          { ok: false, message: "Invalid payment signature." },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const eventData = payload.eventData;

    if (!eventData || !payload.eventType) {
      return NextResponse.json(
        { ok: false, message: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    const paymentReference = String(
      eventData.paymentReference || ""
    );

    const transactionReference = String(
      eventData.transactionReference || ""
    );

    if (!paymentReference || !transactionReference) {
      return NextResponse.json(
        { ok: false, message: "Payment references missing." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const eventReference =
      `${payload.eventType}-${transactionReference}`;

    const { error } = await admin
      .from("payment_events")
      .insert({
        provider: "MONNIFY",
        event_reference: eventReference,
        payment_reference: paymentReference,
        transaction_reference: transactionReference,
        processing_status: "RECEIVED",
      });

    if (error && error.code !== "23505") {
      console.error("Webhook database error:", error.code);

      return NextResponse.json(
        { ok: false, message: "Unable to record payment event." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Webhook received.",
      environment: isSandbox ? "Sandbox" : "Production",
      walletCredit: false,
    });
  } catch (error) {
    console.error("Monnify webhook error:", error);

    return NextResponse.json(
      { ok: false, message: "Webhook processing failed." },
      { status: 500 }
    );
  }
        }
