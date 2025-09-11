import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import ProfilesManager from "@/components/protected/ProfilesManager";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilesManagementPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  const userId = (data as any)?.claims?.sub as string | undefined;
  let hasPin = false;
  if (userId) {
    const { data: rows } = await supabase.from("pin").select("id").eq("user_id", userId).limit(1);
    hasPin = !!(rows && rows.length > 0);
  }

  return (
    <div className="w-full flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <h1 className="text-3xl font-bold">Gérer les profils</h1>
        <p className="text-muted-foreground">
          Créez, modifiez ou supprimez les profils des membres.
        </p>

        {!hasPin ? (
          <Card>
            <CardHeader>
              <CardTitle>Code PIN requis</CardTitle>
              <CardDescription>
                Vous devez définir un code PIN avant de pouvoir créer un profil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Le code PIN sécurise la création et la gestion des profils.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/protected/pin">Définir mon code PIN</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <ProfilesManager />
        )}
      </div>
    </div>
  );
}
