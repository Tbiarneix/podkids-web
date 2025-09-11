import { createClient } from "@/lib/supabase/server";
import PinForm from "@/components/protected/PinForm";

export default async function PinSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  const userId = (data as any)?.claims?.sub as string | undefined;
  let mode: "create" | "update" = "create";
  if (userId) {
    const { data: rows } = await supabase.from("pin").select("id").eq("user_id", userId).limit(1);
    if (rows && rows.length > 0) mode = "update";
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-bold">Code PIN</h1>
        <p className="text-muted-foreground">
          Ajoutez ou modifiez votre code PIN pour sécuriser l’accès.
        </p>
      </div>

      <section className="w-full">
        <div className="mx-auto max-w-3xl rounded-2xl bg-card">
          <PinForm mode={mode} />
        </div>
      </section>
    </div>
  );
}
