import { LoginForm } from "@/components/login-form";
import AuthFormHeader from "@/components/auth-form-header";

export default function Page() {
  return (
    <>
      <AuthFormHeader />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
