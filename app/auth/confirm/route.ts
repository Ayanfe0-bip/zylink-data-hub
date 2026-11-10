import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const allowedTypes: EmailOtpType[] = [
    "signup",
    "email",
    "recovery",
    "invite",
    "magiclink",
    "email_change"
  ];

  if (
    !tokenHash ||
    !type ||
    !allowedTypes.includes(type as EmailOtpType)
  ) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_confirmation_link", origin)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", origin)
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard", origin)
  );
}
