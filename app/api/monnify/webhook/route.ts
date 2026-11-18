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

    // 1. Read original webhook body
    const rawBody = await request.text();

    // 2. Validate production webhook signature
    const isSandbox = baseUrl.includes("sandbox.monnify.com");

    if (!isSandbox) {
      const signature =
        request.headers.get("monnify-signature");

      if (!signature) {
        return NextResponse.json(
          { ok: false, message: "Missing signature." },
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
      const expected = Buffer.from(
        expectedSignature,
        "hex"
      );

      if (
        received.length !== expected.length ||
        !timingSafeEqual(received, expected)
      ) {
        return NextResponse.json(
          { ok: false, message: "Invalid signature." },
          { status: 401 }
        );
      }
    }

    // 3. Read notification
    const payload = JSON.parse(rawBody);
    const eventData = payload.eventData;

    if (
      payload.eventType !== "SUCCESSFUL_TRANSACTION" ||
      !eventData
    ) {
      return NextResponse.json({
        ok: true,
        message: "Event acknowledged.",
        walletCredited: false,
      });
    }

    const paymentReference = String(
      eventData.paymentReference || ""
    );

    const transactionReference = String(
      eventData.transactionReference || ""
    );

    const productType = String(
      eventData.product?.type || ""
    ).toUpperCase();

    const accountReference = String(
      eventData.product?.reference || ""
    );

    if (
      !paymentReference ||
      !transactionReference ||
      !productType
    ) {
      return NextResponse.json(
        { ok: false, message: "Invalid payment details." },
        { status: 400 }
      );
    }

    // 4. Authenticate with Monnify
    const apiKey = process.env.MONNIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, message: "Monnify API key missing." },
        { status: 500 }
      );
    }

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
        { ok: false, message: "Monnify authentication failed." },
        { status: 502 }
      );
    }

    // 5. Verify payment independently with Monnify
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
        { ok: false, message: "Payment verification failed." },
        { status: 502 }
      );
    }

    const payment = verifyResult.responseBody;

    // 6. Confirm authoritative payment details
    if (
      payment.paymentReference !== paymentReference ||
      payment.transactionReference !== transactionReference ||
      payment.paymentStatus !== "PAID" ||
      (payment.currencyCode || payment.currency) !== "NGN"
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Payment could not be confirmed.",
        },
        { status: 409 }
      );
    }

    const amountPaid = Number(payment.amountPaid);
    const amountKobo = Math.round(amountPaid * 100);

    if (
      !Number.isFinite(amountPaid) ||
      amountPaid <= 0 ||
      !Number.isSafeInteger(amountKobo)
    ) {
      return NextResponse.json(
        { ok: false, message: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 7. Identify the correct Zylink customer
    let customerId: string | null = null;

    if (productType === "RESERVED_ACCOUNT") {
      if (!accountReference) {
        return NextResponse.json(
          { ok: false, message: "Account reference missing." },
          { status: 400 }
        );
      }

      const { data: bankAccount, error } = await admin
        .from("customer_bank_accounts")
        .select("customer_id, account_reference, status")
        .eq("account_reference", accountReference)
        .maybeSingle();

      if (error || !bankAccount) {
        return NextResponse.json(
          { ok: false, message: "Zylink account not found." },
          { status: 404 }
        );
      }

      if (bankAccount.status !== "ACTIVE") {
        return NextResponse.json(
          { ok: false, message: "Bank account is not active." },
          { status: 409 }
        );
      }

      customerId = bankAccount.customer_id;

    } else if (
      productType === "WEB_SDK" ||
      productType === "WEB_SDK_TRANSACTION"
    ) {
      const { data: existingDeposit, error } = await admin
        .from("wallet_transactions")
        .select("customer_id, amount_kobo, status")
        .eq("payment_reference", paymentReference)
        .eq("transaction_type", "DEPOSIT")
        .maybeSingle();

      if (error || !existingDeposit) {
        return NextResponse.json(
          { ok: false, message: "Wallet payment record not found." },
          { status: 404 }
        );
      }

      customerId = existingDeposit.customer_id;

      if (
        Number(existingDeposit.amount_kobo) !== amountKobo
      ) {
        return NextResponse.json(
          { ok: false, message: "Payment amount mismatch." },
          { status: 409 }
        );
      }

    } else {
      return NextResponse.json({
        ok: true,
        message: "Unsupported payment product ignored.",
        walletCredited: false,
      });
    }

    // 8. Record the webhook event
    const eventReference =
      `SUCCESSFUL_TRANSACTION-${transactionReference}`;

    const { error: eventError } = await admin
      .from("payment_events")
      .insert({
        provider: "MONNIFY",
        event_reference: eventReference,
        payment_reference: paymentReference,
        transaction_reference: transactionReference,
        processing_status: "RECEIVED",
      });

    if (eventError && eventError.code !== "23505") {
      return NextResponse.json(
        { ok: false, message: "Unable to record payment event." },
        { status: 500 }
      );
    }

    // 9. For dedicated accounts, create a pending deposit
    if (productType === "RESERVED_ACCOUNT") {
      const { error: depositError } = await admin
        .from("wallet_transactions")
        .insert({
          customer_id: customerId,
          transaction_type: "DEPOSIT",
          amount_kobo: amountKobo,
          status: "PENDING",
          payment_reference: paymentReference,
          provider_reference: transactionReference,
          description: "Dedicated bank account funding",
        });

      if (depositError && depositError.code !== "23505") {
        console.error(
          "Deposit creation error:",
          depositError.code
        );

        return NextResponse.json(
          { ok: false, message: "Unable to create deposit." },
          { status: 500 }
        );
      }
    }

    // 10. Credit wallet through the atomic database function
    const { data: credited, error: creditError } =
      await admin.rpc("complete_wallet_deposit", {
        p_payment_reference: paymentReference,
        p_provider_reference: transactionReference,
        p_amount_kobo: amountKobo,
      });

    if (creditError) {
      console.error(
        "Wallet credit error:",
        creditError.message
      );

      return NextResponse.json(
        { ok: false, message: "Wallet credit failed." },
        { status: 500 }
      );
    }

    // 11. Update webhook processing status
    const { error: updateError } = await admin
      .from("payment_events")
      .update({
        processing_status: "PROCESSED",
        processed_at: new Date().toISOString(),
      })
      .eq("event_reference", eventReference);

    if (updateError) {
      console.error(
        "Webhook update error:",
        updateError.code
      );
    }

    return NextResponse.json({
      ok: true,
      message: credited
        ? "Payment verified and wallet credited."
        : "Payment already processed or not eligible.",
      environment: isSandbox ? "Sandbox" : "Production",
      paymentReference,
      transactionReference,
      amountPaid,
      walletCredited: credited === true,
    });

  } catch (error) {
    console.error("Monnify webhook error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
        }
