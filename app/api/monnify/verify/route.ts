import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.MONNIFY_API_KEY;
    const secretKey = process.env.MONNIFY_SECRET_KEY;
    const baseUrl = process.env.MONNIFY_BASE_URL;

    if (!apiKey || !secretKey || !baseUrl) {
      return NextResponse.json(
        {
          ok: false,
          message: "Monnify configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const paymentReference =
      request.nextUrl.searchParams.get("paymentReference");

    if (
      !paymentReference ||
      !/^ZYLINK-[0-9]+-[0-9a-f-]{36}$/i.test(paymentReference)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "A valid Zylink payment reference is required.",
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

    // Verify payment directly with Monnify
    const verifyUrl = new URL(
      `${baseUrl}/api/v2/merchant/transactions/query`
    );

    verifyUrl.searchParams.set(
      "paymentReference",
      paymentReference
    );

    const verifyResponse = await fetch(verifyUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyResult.requestSuccessful) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unable to verify this payment.",
        },
        { status: 400 }
      );
    }

    const payment = verifyResult.responseBody;

    if (payment.paymentReference !== paymentReference) {
      return NextResponse.json(
        {
          ok: false,
          message: "Payment reference does not match.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Payment verification completed.",
      environment: "Sandbox",
      paymentReference: payment.paymentReference,
      transactionReference: payment.transactionReference,
      paymentStatus: payment.paymentStatus,
      amountPaid: payment.amountPaid,
      totalPayable: payment.totalPayable,
      currencyCode: payment.currencyCode,
      paidOn: payment.paidOn || null,
    });

  } catch (error) {
    console.error("Monnify verification error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Something went wrong while verifying payment.",
      },
      { status: 500 }
    );
  }
  }
