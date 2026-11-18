import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
try {
// 1. Authenticate the customer
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

// 2. Validate customer information
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

// 3. Check Monnify configuration
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

// 4. Connect to the secure database
const admin = createAdminClient();

// Return an existing account instead of creating another one
const { data: existingAccount, error: lookupError } =
  await admin
    .from("customer_bank_accounts")
    .select("*")
    .eq("customer_id", user.id)
    .maybeSingle();

if (lookupError) {
  return NextResponse.json(
    { ok: false, message: "Unable to check your bank account." },
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

const accessToken = authResult.responseBody.accessToken;

// 6. Generate a unique account reference
const accountReference = `ZYLINK-${user.id}-${randomUUID()}`;

// 7. Prepare the reserved account request
const accountData: Record<string, string> = {
  accountReference,
  accountName: customerName,
  currencyCode: "NGN",
  contractCode,
  customerEmail,
  customerName,
};

// Send only the identity type selected by the customer.
accountData[identityType.toLowerCase()] = identityNumber;

// 8. Request the dedicated account from Monnify
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

const accountResult = await accountResponse.json();

if (
  !accountResponse.ok ||
  !accountResult.requestSuccessful ||
  !accountResult.responseBody
) {
  return NextResponse.json(
    {
      ok: false,
      message:
        accountResult.responseMessage ||
        "Unable to generate your dedicated bank account.",
    },
    { status: 400 }
  );
}

const reserved = accountResult.responseBody;
const bankAccount = reserved.accounts?.[0];

if (
  !bankAccount?.accountNumber ||
  !bankAccount?.bankName
) {
  return NextResponse.json(
    {
      ok: false,
      message: "Monnify returned incomplete account details.",
    },
    { status: 502 }
  );
}

// 9. Save the account against the authenticated customer
const { error: saveError } = await admin
  .from("customer_bank_accounts")
  .insert({
    customer_id: user.id,
    account_number: bankAccount.accountNumber,
    account_name: bankAccount.accountName || customerName,
    bank_name: bankAccount.bankName,
    bank_code: bankAccount.bankCode || null,
    account_reference: reserved.accountReference || accountReference,
    reservation_reference: reserved.reservationReference || null,
    provider: "MONNIFY",
    status: reserved.status === "ACTIVE" ? "ACTIVE" : "PENDING",
  });

if (saveError) {
  console.error("Reserved account database save failed:", {
    code: saveError.code,
  });

  return NextResponse.json(
    {
      ok: false,
      message:
        "Your account was generated, but we could not save its details. Please contact support before retrying.",
    },
    { status: 500 }
  );
}

// 10. Return safe account details
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
console.error("Reserved account generation error:", error);

return NextResponse.json(
  {
    ok: false,
    message: "Something went wrong while generating your bank account.",
  },
  { status: 500 }
);

}
}
