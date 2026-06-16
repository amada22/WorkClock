import Link from "next/link";
import { Clock3, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Login | Workclock",
};

export default function LoginPage() {
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
          <h1 className="text-2xl font-semibold tracking-normal">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login to continue to your work clock.
          </p>
        </div>

        <form className="space-y-4">
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
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-10"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" className="h-10 w-full">
            <LogIn className="size-4" aria-hidden="true" />
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
