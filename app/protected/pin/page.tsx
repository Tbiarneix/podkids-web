import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import PinForm from "@/components/protected/PinForm";

export default async function PinSettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = (data as any)?.claims?.sub as string | undefined;
  let mode: "create" | "update" = "create";
  if (userId) {
    const { data: rows } = await supabase
      .from("pin")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    if (rows && rows.length > 0) mode = "update";
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="max-w-3xl w-full mx-auto">
        <h1 className="text-3xl font-bold">Code PIN</h1>
        <p className="text-muted-foreground">
          Ajoutez ou modifiez votre code PIN pour sécuriser l’accès.
        </p>
      </div>

      <section className="w-full">
        <div className="max-w-3xl mx-auto rounded-2xl bg-card">
          <PinForm mode={mode} />
        </div>
      </section>
    </div>
  );
}
