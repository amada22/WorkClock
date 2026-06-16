import Link from "next/link";
import { Clock3 } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register | Workclock",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <section className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mx-auto mb-5 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            aria-label="Go to home"
          >
            <Clock3 className="size-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-normal">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register to start tracking your workday.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
