import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Merci pour votre inscription!
              </CardTitle>
              <CardDescription>Vérifiez votre email pour confirmer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vous avez bien effectué votre inscription. Veuillez vérifier votre email pour confirmer votre compte avant de vous connecter.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
