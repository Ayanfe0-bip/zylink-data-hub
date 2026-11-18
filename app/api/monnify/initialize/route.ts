import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate customer
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Please sign in first." },
        { status: 401 }
      );
    }

    // 2. Get customer details from Supabase
    const customerName = String(
      user.user_metadata?.full_name || ""
    ).trim();

    const customerEmail = String(user.email || "")
      .trim()
      .toLowerCase();

    if (customerName.length < 2 || !customerEmail) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please complete your profile name and email.",
        },
        { status: 400 }
      );
    }

    // 3. Validate payment amount
    const body = await request.json();
    const amount = Number(body.amount);

    if (
      !Number.isFinite(amount) ||
      amount < 20 ||
      amount > 1000000 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Enter a valid payment amount.",
        },
        { status: 400 }
      );
    }

    const amountKobo = Math.round(amount * 100);

    // 4. Check Monnify configuration
    const apiKey = process.env.MONNIFY_API_KEY;
    const secretKey = process.env.MONNIFY_SECRET_KEY;
    const contractCode = process.env.MONNIFY_CONTRACT_CODE;
    const baseUrl = process.env.MONNIFY_BASE_URL;

    if (!apiKey || !secretKey || !contractCode || !baseUrl) {
      return NextResponse.json(
        {
          ok: false,
          message: "Monnify configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    // 5. Create unique payment reference
    const paymentReference =
      `ZYLINK-${Date.now()}-${randomUUID()}`;

    const admin = createAdminClient();

    // 6. Record pending transaction
    const { error: transactionError } = await admin
      .from("wallet_transactions")
      .insert({
        customer_id: user.id,
        transaction_type: "DEPOSIT",
        amount_kobo: amountKobo,
        status: "PENDING",
        payment_reference: paymentReference,
        description: "Zylink wallet funding",
      });

    if (transactionError) {
      console.error(
        "Wallet transaction creation failed:",
        transactionError.code
      );

      return NextResponse.json(
        {
          ok: false,
          message: "Unable to create your wallet payment record.",
        },
        { status: 500 }
      );
    }

    // 7. Authenticate with Monnify
    const credentials = Buffer.from(
      `${apiKey}:${secretKey}`
    ).toString("base64");

    const authResponse = await fetch(
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

    const authResult = await authResponse.json();

    if (
      !authResponse.ok ||
      !authResult.requestSuccessful ||
      !authResult.responseBody?.accessToken
    ) {
      await admin
        .from("wallet_transactions")
        .update({ status: "FAILED" })
        .eq("payment_reference", paymentReference);

      return NextResponse.json(
        {
          ok: false,
          message: "Monnify authentication failed.",
        },
        { status: 502 }
      );
    }

    const accessToken = authResult.responseBody.accessToken;

    // 8. Initialize payment
    const paymentData = {
      amount,
      customerName,
      customerEmail,
      paymentReference,
      paymentDescription: "Zylink Wallet Funding",
      currencyCode: "NGN",
      contractCode,
      redirectUrl:
        "https://zylink-data-hub.vercel.app/wallet",
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
    };

    const paymentResponse = await fetch(
      `${baseUrl}/api/v1/merchant/transactions/init-transaction`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
        cache: "no-store",
      }
    );

    const paymentResult = await paymentResponse.json();

    if (
      !paymentResponse.ok ||
      !paymentResult.requestSuccessful ||
      !paymentResult.responseBody?.checkoutUrl
    ) {
      await admin
        .from("wallet_transactions")
        .update({ status: "FAILED" })
        .eq("payment_reference", paymentReference);

      return NextResponse.json(
        {
          ok: false,
          message:
            paymentResult.responseMessage ||
            "Unable to initialize payment.",
        },
        { status: 502 }
      );
    }

    // 9. Return checkout details
    return NextResponse.json({
      ok: true,
      message: "Wallet payment initialized successfully.",
      environment: baseUrl.includes("sandbox")
        ? "Sandbox"
        : "Production",
      paymentReference,
      transactionReference:
        paymentResult.responseBody.transactionReference,
      checkoutUrl: paymentResult.responseBody.checkoutUrl,
    });

  } catch (error) {
    console.error("Monnify initialization error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Something went wrong while initializing payment.",
      },
      { status: 500 }
    );
  }
        }
