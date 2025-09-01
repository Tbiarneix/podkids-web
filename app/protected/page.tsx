import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, KeyRound, Users, Podcast, Play } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {/* Spacer to compensate BackToSettings not rendered on root */}
      <div className="h-8" aria-hidden />
      <div className="w-full">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Card className="min-h-[12rem] flex flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <Settings className="size-8 text-primary mb-2" aria-hidden />
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles, email et préférences.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center mt-auto">
              <Button asChild>
                <Link href="/protected/account">Gérer</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="min-h-[12rem] flex flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <KeyRound className="size-8 text-primary mb-2" aria-hidden />
              <CardTitle>Gérer mon code PIN</CardTitle>
              <CardDescription>
                Configurez un code PIN pour sécuriser l’accès au webplayer.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center mt-auto">
              <Button asChild>
                <Link href="/protected/pin">Configurer</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="min-h-[12rem] flex flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <Users className="size-8 text-primary mb-2" aria-hidden />
              <CardTitle>Gérer les profils</CardTitle>
              <CardDescription>
                Gérez les profils des membres de la famille.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center mt-auto">
              <Button asChild>
                <Link href="/protected/profiles">Ouvrir</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="min-h-[12rem] flex flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <Podcast className="size-8 text-primary mb-2" aria-hidden />
              <CardTitle>Gérer les podcasts</CardTitle>
              <CardDescription>
                Ajoutez, organisez et gérez vos podcasts.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center mt-auto">
              <Button asChild>
                <Link href="/protected/podcasts">Gérer</Link>
              </Button>
            </CardFooter>
          </Card>

        </div>
        
        <div className="mt-12 flex justify-center">
          <Button size="xl" asChild>
            <Link href="/webplayer" className="inline-flex items-center gap-2">
              <Play className="size-5" aria-hidden />
              <span>Accéder au player web</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
