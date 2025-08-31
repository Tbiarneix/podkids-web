import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ProfilesManager from "@/components/protected/ProfilesManager";

export default async function ProfilesManagementPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Gérer les profils</h1>
      <p className="text-muted-foreground">Créez, modifiez ou supprimez les profils des membres.</p>

      <ProfilesManager />
    </div>
  );
}
