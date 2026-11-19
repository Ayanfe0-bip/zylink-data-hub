import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./dashboard-shell";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;

  if (error || !claims) {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string"
      ? claims.email
      : "Zylink customer";

  const userId =
    typeof claims.sub === "string"
      ? claims.sub
      : null;

  if (!userId) {
    redirect("/login");
  }

  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance_kobo")
    .eq("customer_id", userId)
    .maybeSingle();

  const balanceKobo = Number(
    wallet?.balance_kobo ?? 0
  );

  return (
    <DashboardShell
      email={email}
      balanceKobo={balanceKobo}
    />
  );
}
