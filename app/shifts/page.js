"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Download, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "--";

  return new Date(value).toLocaleDateString("en-GB");
}

function formatTime(value) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAdmin(user) {
  return user?.role?.toLowerCase() === "admin";
}

export default function ShiftsPage() {
  const router = useRouter();
  const today = useMemo(() => toDateInputValue(new Date()), []);

  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("day");
  const [shifts, setShifts] = useState([]);
  const [day, setDay] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedRange = useMemo(() => {
    if (mode === "day") {
      return { startDate: day, endDate: day };
    }

    return { startDate, endDate };
  }, [day, endDate, mode, startDate]);

  const rangeIsValid =
    selectedRange.startDate &&
    selectedRange.endDate &&
    selectedRange.startDate <= selectedRange.endDate;

  const loadShifts = useCallback(async () => {
    if (!rangeIsValid) {
      setShifts([]);
      setError("Choose a valid date range.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams(selectedRange);
      const res = await fetch(`/api/shifts/all?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setShifts([]);
        setError(data.message ?? "Could not load shifts.");
        setLoading(false);
        return;
      }

      setShifts(data.shifts || []);
    } catch {
      setShifts([]);
      setError("Could not load shifts.");
    } finally {
      setLoading(false);
    }
  }, [rangeIsValid, selectedRange]);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      setUser(data.user);

      if (!isAdmin(data.user)) {
        router.replace("/");
      }
    }

    loadUser();
  }, [router]);

  useEffect(() => {
    if (isAdmin(user)) {
      loadShifts();
    }
  }, [loadShifts, user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });

    router.push("/login");
    router.refresh();
  }

  function handleDownload() {
    if (!rangeIsValid) {
      setError("Choose a valid date range before downloading.");
      return;
    }

    const params = new URLSearchParams(selectedRange);
    window.location.href = `/api/shifts/export?${params.toString()}`;
  }

  const emptyMessage =
    mode === "day"
      ? "No shifts found for this date."
      : "No shifts found for this period.";

  return (
    <main className="min-h-screen bg-muted/30">
      <nav className="border-b bg-background">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock3 className="size-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold">Physioneed</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>
              Dashboard
            </Button>

            <Button variant="default">
              Shifts
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Shifts</CardTitle>

              <Button onClick={handleDownload} disabled={loading || !rangeIsValid}>
                <Download className="size-4" aria-hidden="true" />
                Download Excel
              </Button>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 md:flex-row md:items-end md:justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === "day" ? "default" : "outline"}
                  onClick={() => setMode("day")}
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  One Day
                </Button>
                <Button
                  type="button"
                  variant={mode === "range" ? "default" : "outline"}
                  onClick={() => setMode("range")}
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Period
                </Button>
              </div>

              {mode === "day" ? (
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="shift-day">
                    Day
                  </label>
                  <Input
                    id="shift-day"
                    type="date"
                    value={day}
                    onChange={(event) => setDay(event.target.value)}
                    className="w-full md:w-44"
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="shift-start">
                      From
                    </label>
                    <Input
                      id="shift-start"
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full md:w-44"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="shift-end">
                      To
                    </label>
                    <Input
                      id="shift-end"
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full md:w-44"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {error ? (
              <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Break Start</TableHead>
                  <TableHead>Break End</TableHead>
                  <TableHead>End</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{shift.name}</TableCell>
                      <TableCell>{formatDate(shift.work_date)}</TableCell>
                      <TableCell>{formatTime(shift.shift_start)}</TableCell>
                      <TableCell>{formatTime(shift.break_start)}</TableCell>
                      <TableCell>{formatTime(shift.break_end)}</TableCell>
                      <TableCell>{formatTime(shift.shift_end)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
