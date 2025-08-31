import { SignUpForm } from "@/components/sign-up-form";
import AuthFormHeader from "@/components/auth-form-header";

export default function Page() {
  return (
    <>
      <AuthFormHeader />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
    </>
  );
}
