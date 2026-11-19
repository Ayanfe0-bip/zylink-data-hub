import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readResponse(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      requestSuccessful: false,
      responseMessage: text.slice(0, 500) || "Empty response",
    };
  }
}

export async function POST(request: NextRequest) {
  let stage = "START";

  try {
    stage = "CUSTOMER_AUTHENTICATION";

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, message: "Please sign in to continue." },
        { status: 401 }
      );
    }

    stage = "INPUT_VALIDATION";

    const body = await request.json();

    const identityType = String(body.identityType || "")
      .trim()
      .toUpperCase();

    const identityNumber = String(body.identityNumber || "").trim();

    if (!["BVN", "NIN"].includes(identityType)) {
      return NextResponse.json(
        { ok: false, message: "Choose BVN or NIN." },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(identityNumber)) {
      return NextResponse.json(
        {
          ok: false,
          message: `${identityType} must contain exactly 11 digits.`,
        },
        { status: 400 }
      );
    }

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
          message: "Please complete your profile name and email first.",
        },
        { status: 400 }
      );
    }

    stage = "MONNIFY_CONFIGURATION";

    const apiKey = process.env.MONNIFY_API_KEY;
    const secretKey = process.env.MONNIFY_SECRET_KEY;
    const contractCode = process.env.MONNIFY_CONTRACT_CODE;
    const baseUrl = process.env.MONNIFY_BASE_URL;

    if (!apiKey || !secretKey || !contractCode || !baseUrl) {
      console.error("[Zylink Reserved Account] Missing configuration.");

      return NextResponse.json(
        {
          ok: false,
          message: "Monnify configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    stage = "DATABASE_LOOKUP";

    const admin = createAdminClient();

    const { data: existingAccount, error: lookupError } = await admin
      .from("customer_bank_accounts")
      .select("*")
      .eq("customer_id", user.id)
      .maybeSingle();

    if (lookupError) {
      console.error("[Zylink Reserved Account] Database lookup failed:", {
        code: lookupError.code,
        message: lookupError.message,
      });

      return NextResponse.json(
        {
          ok: false,
          message: "Unable to check your bank account.",
        },
        { status: 500 }
      );
    }

    if (existingAccount?.status === "ACTIVE") {
      return NextResponse.json({
        ok: true,
        message: "Your dedicated bank account already exists.",
        account: {
          accountNumber: existingAccount.account_number,
          accountName: existingAccount.account_name,
          bankName: existingAccount.bank_name,
          status: existingAccount.status,
        },
      });
    }

    if (existingAccount) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Your previous account request needs attention. Please contact support.",
        },
        { status: 409 }
      );
    }

    stage = "MONNIFY_AUTHENTICATION";

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

    const authResult = await readResponse(authResponse);

    if (
      !authResponse.ok ||
      !authResult.requestSuccessful ||
      !authResult.responseBody?.accessToken
    ) {
      console.error("[Zylink Reserved Account] Monnify authentication failed:", {
        stage,
        httpStatus: authResponse.status,
        responseCode: authResult.responseCode,
        responseMessage: authResult.responseMessage,
      });

      return NextResponse.json(
        {
          ok: false,
          message: "Monnify authentication failed. Please try again later.",
        },
        { status: 502 }
      );
    }

    const accessToken = authResult.responseBody.accessToken;

    stage = "RESERVED_ACCOUNT_REQUEST";

    const accountReference = `ZYLINK-${user.id}-${randomUUID()}`;

    const accountData: Record<string, unknown> = {
      accountReference,
      accountName: customerName,
      currencyCode: "NGN",
      contractCode,
      customerEmail,
      customerName,
      getAllAvailableBanks: true,
    };

    accountData[identityType.toLowerCase()] = identityNumber;

    const accountResponse = await fetch(
      `${baseUrl}/api/v2/bank-transfer/reserved-accounts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
        cache: "no-store",
      }
    );

    const accountResult = await readResponse(accountResponse);

    if (
      !accountResponse.ok ||
      !accountResult.requestSuccessful ||
      !accountResult.responseBody
    ) {
      console.error("[Zylink Reserved Account] Monnify rejected request:", {
        stage,
        httpStatus: accountResponse.status,
        responseCode: accountResult.responseCode,
        responseMessage: accountResult.responseMessage,
        requestSuccessful: accountResult.requestSuccessful,
      });

      return NextResponse.json(
        {
          ok: false,
          message:
            accountResult.responseMessage ||
            "Monnify could not generate your account. Please try again later.",
        },
        { status: 502 }
      );
    }

    stage = "ACCOUNT_RESPONSE_VALIDATION";

    const reserved = accountResult.responseBody;
    const bankAccount = reserved.accounts?.[0];

    if (!bankAccount?.accountNumber || !bankAccount?.bankName) {
      console.error("[Zylink Reserved Account] Incomplete Monnify response:", {
        stage,
        responseCode: accountResult.responseCode,
        responseMessage: accountResult.responseMessage,
      });

      return NextResponse.json(
        {
          ok: false,
          message: "Monnify returned incomplete account details.",
        },
        { status: 502 }
      );
    }

    stage = "DATABASE_SAVE";

    const { error: saveError } = await admin
      .from("customer_bank_accounts")
      .insert({
        customer_id: user.id,
        account_number: bankAccount.accountNumber,
        account_name: bankAccount.accountName || customerName,
        bank_name: bankAccount.bankName,
        bank_code: bankAccount.bankCode || null,
        account_reference:
          reserved.accountReference || accountReference,
        reservation_reference:
          reserved.reservationReference || null,
        provider: "MONNIFY",
        status: reserved.status === "ACTIVE" ? "ACTIVE" : "PENDING",
      });

    if (saveError) {
      console.error("[Zylink Reserved Account] Database save failed:", {
        stage,
        code: saveError.code,
        message: saveError.message,
      });

      return NextResponse.json(
        {
          ok: false,
          message:
            "Your account may have been generated, but we could not save its details. Please contact support before retrying.",
        },
        { status: 500 }
      );
    }

    console.info("[Zylink Reserved Account] Account created successfully.");

    return NextResponse.json({
      ok: true,
      message: "Dedicated bank account generated successfully.",
      account: {
        accountNumber: bankAccount.accountNumber,
        accountName: bankAccount.accountName || customerName,
        bankName: bankAccount.bankName,
        status: reserved.status,
      },
    });
  } catch (error) {
    console.error("[Zylink Reserved Account] Unexpected failure:", {
      stage,
      error:
        error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          "Something went wrong while generating your bank account. Please try again later.",
      },
      { status: 500 }
    );
  }
        }
