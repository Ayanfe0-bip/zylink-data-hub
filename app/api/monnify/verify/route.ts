import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the customer
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

    // 2. Validate payment reference
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

    const admin = createAdminClient();

    // 3. Find this customer's pending deposit
    const { data: transaction, error: transactionError } =
      await admin
        .from("wallet_transactions")
        .select(
          "customer_id, amount_kobo, status, transaction_type"
        )
        .eq("payment_reference", paymentReference)
        .eq("customer_id", user.id)
        .maybeSingle();

    if (transactionError || !transaction) {
      return NextResponse.json(
        {
          ok: false,
          message: "This payment does not belong to your account.",
        },
        { status: 404 }
      );
    }

    if (transaction.transaction_type !== "DEPOSIT") {
      return NextResponse.json(
        {
          ok: false,
          message: "This is not a wallet deposit.",
        },
        { status: 400 }
      );
    }

    // 4. Check Monnify configuration
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

    // 5. Authenticate with Monnify
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
        { status: 502 }
      );
    }

    // 6. Verify directly with Monnify
    const verifyUrl = new URL(
      `${baseUrl}/api/v2/merchant/transactions/query`
    );

    verifyUrl.searchParams.set(
      "paymentReference",
      paymentReference
    );

    const verifyResponse = await fetch(
      verifyUrl.toString(),
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${authResult.responseBody.accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const verifyResult = await verifyResponse.json();

    if (
      !verifyResponse.ok ||
      !verifyResult.requestSuccessful
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unable to verify this payment.",
        },
        { status: 502 }
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

    const paymentStatus = payment.paymentStatus;

    // 7. Do not credit unsuccessful or pending payments
    if (paymentStatus !== "PAID") {
      return NextResponse.json({
        ok: true,
        message: "Payment verification completed.",
        paymentReference,
        paymentStatus,
        walletCredited: false,
      });
    }

    // 8. Validate amount and currency
    const amountPaid = Number(payment.amountPaid);
    const amountPaidKobo = Math.round(amountPaid * 100);

    if (
      payment.currencyCode !== "NGN" ||
      !Number.isFinite(amountPaid) ||
      amountPaidKobo !== Number(transaction.amount_kobo)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Payment amount or currency does not match.",
          walletCredited: false,
        },
        { status: 409 }
      );
    }

    // 9. Already credited? Do not credit again.
    if (transaction.status === "SUCCESS") {
      return NextResponse.json({
        ok: true,
        message: "This payment has already been credited.",
        paymentReference,
        paymentStatus,
        walletCredited: false,
        alreadyCredited: true,
      });
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        {
          ok: false,
          message: "This wallet transaction is not pending.",
          walletCredited: false,
        },
        { status: 409 }
      );
    }

    // 10. Credit wallet through the atomic database function
    const { data: credited, error: creditError } =
      await admin.rpc("complete_wallet_deposit", {
        p_payment_reference: paymentReference,
        p_provider_reference:
          payment.transactionReference || "",
        p_amount_kobo: amountPaidKobo,
      });

    if (creditError) {
      console.error(
        "Wallet credit failed:",
        creditError.message
      );

      return NextResponse.json(
        {
          ok: false,
          message: "Payment was confirmed, but wallet credit failed.",
          walletCredited: false,
        },
        { status: 500 }
      );
    }

    if (!credited) {
      // Check whether another request already completed it.
      const { data: latestTransaction } = await admin
        .from("wallet_transactions")
        .select("status")
        .eq("payment_reference", paymentReference)
        .maybeSingle();

      if (latestTransaction?.status === "SUCCESS") {
        return NextResponse.json({
          ok: true,
          message: "This payment has already been credited.",
          paymentReference,
          paymentStatus,
          walletCredited: false,
          alreadyCredited: true,
        });
      }

      return NextResponse.json(
        {
          ok: false,
          message: "Wallet credit was not completed.",
          walletCredited: false,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Payment confirmed and wallet credited successfully.",
      environment: baseUrl.includes("sandbox")
        ? "Sandbox"
        : "Production",
      paymentReference,
      transactionReference: payment.transactionReference,
      paymentStatus,
      amountPaid: payment.amountPaid,
      walletCredited: true,
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
