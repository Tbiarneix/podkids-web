import Link from "next/link";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, KeyRound, Users, Podcast } from "lucide-react";

export default async function ProtectedPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-12">
      <div className="h-8" aria-hidden />
      <div className="w-full">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Card className="flex min-h-[12rem] flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <Settings className="mb-2 size-8 text-primary" aria-hidden />
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles, email et préférences.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto justify-center">
              <span
                title="Paramètres indisponibles pour l'instant"
                className="inline-block"
                aria-label="Paramètres indisponibles pour l'instant"
              >
                <Button disabled aria-disabled>
                  Gérer
                </Button>
              </span>
            </CardFooter>
          </Card>

          <Card className="flex min-h-[12rem] flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <KeyRound className="mb-2 size-8 text-primary" aria-hidden />
              <CardTitle>Gérer mon code PIN</CardTitle>
              <CardDescription>
                Configurez un code PIN pour sécuriser l’accès au webplayer.
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto justify-center">
              <Button asChild>
                <Link href="/protected/pin">Configurer</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex min-h-[12rem] flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <Users className="mb-2 size-8 text-primary" aria-hidden />
              <CardTitle>Gérer les profils</CardTitle>
              <CardDescription>Gérez les profils des membres de la famille.</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto justify-center">
              <Button asChild>
                <Link href="/protected/profiles">Ouvrir</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex min-h-[12rem] flex-col">
            <CardHeader className="flex-1 items-center text-center">
              <Podcast className="mb-2 size-8 text-primary" aria-hidden />
              <CardTitle>Gérer les podcasts</CardTitle>
              <CardDescription>Ajoutez, organisez et gérez vos podcasts.</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto justify-center">
              <Button asChild>
                <Link href="/protected/podcasts">Gérer</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
