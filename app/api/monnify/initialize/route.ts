import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();

    const amount = Number(body.amount);
    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "")
      .trim()
      .toLowerCase();

    if (
      !Number.isFinite(amount) ||
      amount < 20 ||
      amount > 1000000
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Enter a valid payment amount.",
        },
        { status: 400 }
      );
    }

    if (customerName.length < 2 || customerName.length > 100) {
      return NextResponse.json(
        {
          ok: false,
          message: "Enter a valid customer name.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Authenticate with Monnify
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
      return NextResponse.json(
        {
          ok: false,
          message: "Monnify authentication failed.",
        },
        { status: 401 }
      );
    }

    const accessToken = authResult.responseBody.accessToken;

    // Generate a unique payment reference
    const paymentReference = `ZYLINK-${Date.now()}-${randomUUID()}`;

    // Prepare payment details
    const paymentData = {
      amount,
      customerName,
      customerEmail,
      paymentReference,
      paymentDescription: "Zylink Data Hub Payment",
      currencyCode: "NGN",
      contractCode,
      redirectUrl: "https://zylink-data-hub.vercel.app/",
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
    };

    // Initialize Monnify payment
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
      console.error(
        "Monnify initialization failed:",
        paymentResult.responseMessage
      );

      return NextResponse.json(
        {
          ok: false,
          message: "Unable to initialize payment.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Payment initialized successfully.",
      environment: "Sandbox",
      paymentReference:
        paymentResult.responseBody.paymentReference ||
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
