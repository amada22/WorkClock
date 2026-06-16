"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  LogOut,
  Timer,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  const [now, setNow] = useState(() => new Date());
  const user = {
    name: "Alex Morgan",
    role: "Employee",
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  const currentDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <main className="min-h-screen bg-muted/30">
      <nav className="border-b bg-background">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock3 className="size-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold tracking-normal">Physioneed</span>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border bg-card">
                <UserRound className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>

            <Button variant="outline" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-muted-foreground" suppressHydrationWarning>
            {currentDate}
          </p>
          <h1
            className="mt-3 text-5xl font-semibold tracking-normal sm:text-7xl"
            suppressHydrationWarning
          >
            {currentTime}
          </h1>
        </div>

        <Button className="size-36 flex-col rounded-full border border-black text-base shadow-none transition-transform hover:scale-105 sm:size-40">
          <Timer className="size-9" aria-hidden="true" />
          <span className="mt-2 text-lg font-semibold">Clock In</span>
          <span className="text-xs font-normal text-primary-foreground/75">Start shift</span>
        </Button>

        <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
          <article className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
              <Timer className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium">Today&apos;s Hours</h2>
            <p className="mt-2 text-3xl font-semibold tracking-normal">0h 00m</p>
            <p className="mt-1 text-sm text-muted-foreground">No active shift yet.</p>
          </article>

          <article className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium">Shift Status</h2>
            <p className="mt-2 text-3xl font-semibold tracking-normal">Ready</p>
            <p className="mt-1 text-sm text-muted-foreground">You can clock in now.</p>
          </article>

          <article className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
              <CalendarDays className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium">Next Break</h2>
            <p className="mt-2 text-3xl font-semibold tracking-normal">--:--</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Break time appears after clock in.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
