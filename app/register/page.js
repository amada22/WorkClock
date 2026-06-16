import Link from "next/link";
import { Clock3, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="h-10"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-10"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-10"
              placeholder="At least 8 characters"
            />
          </div>

          <Button type="submit" className="h-10 w-full">
            <UserPlus className="size-4" aria-hidden="true" />
            Register
          </Button>
        </form>

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
