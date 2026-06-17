"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Clock3,
  Coffee,
  LogOut,
  Timer,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

function formatDuration(milliseconds) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatTimer(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

function formatTime(value) {
  if (!value) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getLiveWorkedMilliseconds(shift, status, now) {
  if (!shift) {
    return 0;
  }

  const shiftStart = new Date(shift.shift_start).getTime();
  const shiftEnd = shift.shift_end ? new Date(shift.shift_end).getTime() : now.getTime();
  const breakStart = shift.break_start ? new Date(shift.break_start).getTime() : null;
  const breakEnd = shift.break_end ? new Date(shift.break_end).getTime() : null;
  let breakMilliseconds = 0;

  if (breakStart) {
    breakMilliseconds = (breakEnd ?? now.getTime()) - breakStart;
  }

  if (status === "finished") {
    return Math.max(0, shiftEnd - shiftStart - breakMilliseconds);
  }

  return Math.max(0, now.getTime() - shiftStart - breakMilliseconds);
}

function getLiveBreakMilliseconds(shift, now) {
  if (!shift?.break_start) {
    return 0;
  }

  const breakStart = new Date(shift.break_start).getTime();
  const breakEnd = shift.break_end ? new Date(shift.break_end).getTime() : now.getTime();

  return Math.max(0, breakEnd - breakStart);
}

export default function Home() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [user, setUser] = useState(null);
  const [shift, setShift] = useState(null);
  const [status, setStatus] = useState("ready");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadDashboard = useCallback(async () => {
    setError("");

    try {
      const userResponse = await fetch("/api/auth/me");

      if (!userResponse.ok) {
        router.replace("/login");
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      const shiftResponse = await fetch("/api/shifts/today");

      if (!shiftResponse.ok) {
        throw new Error("Could not load today's shift.");
      }

      const shiftData = await shiftResponse.json();
      setShift(shiftData.shift);
      setStatus(shiftData.status);
    } catch {
      setError("Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function runShiftAction(endpoint) {
    setError("");
    setIsActionLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Could not update shift.");
        return;
      }

      setShift(data.shift);
      setStatus(data.status);
    } catch {
      setError("Could not update shift. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleMainAction() {
    if (status === "ready") {
      navigator.geolocation.getCurrentPosition(
  async (position) => {
    const response = await fetch("/api/shifts/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Could not start shift.");
      return;
    }

    setShift(data.shift);
    setStatus(data.status);
  },
  () => {
    setError("Please allow location access to start your shift.");
  }
);

return;
  
    }

    if (status === "break") {
      await runShiftAction("/api/shifts/break/end");
      return;
    }

    if (status === "working") {
      await runShiftAction("/api/shifts/end");
    }
  }

  async function handleBreakAction() {
    if (status === "working") {
      await runShiftAction("/api/shifts/break/start");
      return;
    }

    if (status === "break") {
      await runShiftAction("/api/shifts/break/end");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

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

  const workedMilliseconds = useMemo(
    () => getLiveWorkedMilliseconds(shift, status, now),
    [shift, status, now]
  );
  const breakMilliseconds = useMemo(
    () => getLiveBreakMilliseconds(shift, now),
    [shift, now]
  );

  const statusCopy = {
    ready: {
      title: "Ready",
      detail: "You can clock in now.",
      mainLabel: "Clock In",
      subLabel: "Start shift",
    },
    working: {
      title: "Working",
      detail: `Started at ${formatTime(shift?.shift_start)}.`,
      mainLabel: "Clock Out",
      subLabel: "End shift",
    },
    break: {
      title: "On Break",
      detail: `Break started at ${formatTime(shift?.break_start)}.`,
      mainLabel: "End Break",
      subLabel: "Resume work",
    },
    finished: {
      title: "Finished",
      detail: `Ended at ${formatTime(shift?.shift_end)}.`,
      mainLabel: "Done",
      subLabel: "Shift complete",
    },
  }[status];

  const canUseMainButton = !isLoading && !isActionLoading && status !== "finished";
  const canUseBreakButton =
    !isLoading && !isActionLoading && (status === "working" || status === "break");
  const activeTimerLabel = status === "break" ? "Break Time" : "Work Time";
  const activeTimer = status === "break" ? breakMilliseconds : workedMilliseconds;

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
                <p className="text-sm font-medium leading-none">
                  {isLoading ? "Loading..." : user?.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isLoading ? "Checking role" : user?.role}
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
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

        <Button
          className="size-36 flex-col rounded-full border border-black text-base shadow-none transition-transform hover:scale-105 disabled:translate-y-0 disabled:opacity-60 sm:size-40"
          disabled={!canUseMainButton}
          onClick={handleMainAction}
        >
          {status === "break" ? (
            <Coffee className="size-8" aria-hidden="true" />
          ) : (
            <Timer className="size-8" aria-hidden="true" />
          )}
          <span
            className="mt-2 text-2xl font-semibold leading-none tracking-normal"
            suppressHydrationWarning
          >
            {formatTimer(activeTimer)}
          </span>
          <span className="mt-1 text-xs font-normal text-primary-foreground/75">
            {activeTimerLabel}
          </span>
          <span className="mt-2 text-sm font-semibold">
            {isActionLoading ? "Saving..." : statusCopy.mainLabel}
          </span>
        </Button>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            className="h-10"
            disabled={!canUseBreakButton}
            onClick={handleBreakAction}
          >
            <Coffee className="size-4" aria-hidden="true" />
            {status === "break" ? "End Break" : "Start Break"}
          </Button>
        </div>

        {error ? (
          <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
          <article className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
              <Timer className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium">Today&apos;s Hours</h2>
            <p
              className="mt-2 text-3xl font-semibold tracking-normal"
              suppressHydrationWarning
            >
              {formatTimer(workedMilliseconds)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {shift
                ? `${formatDuration(workedMilliseconds)} total since ${formatTime(shift.shift_start)}`
                : "No active shift yet."}
            </p>
          </article>

          <article className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium">Shift Status</h2>
            <p className="mt-2 text-3xl font-semibold tracking-normal">
              {statusCopy.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{statusCopy.detail}</p>
          </article>

          <article className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
              <Coffee className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-medium">Break Time</h2>
            <p
              className="mt-2 text-3xl font-semibold tracking-normal"
              suppressHydrationWarning
            >
              {formatTimer(breakMilliseconds)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {shift?.break_end
                ? `${formatDuration(breakMilliseconds)} total, ended ${formatTime(shift.break_end)}`
                : shift?.break_start
                  ? `Started ${formatTime(shift.break_start)}. Work timer is paused.`
                  : "No break recorded yet."}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
