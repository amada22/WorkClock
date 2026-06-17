"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, LogOut, Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

/* ---------------- helpers ---------------- */

function formatTime(value) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------------- page ---------------- */

export default function ShiftsPage() {
  const router = useRouter();

  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function load() {
    setLoading(true);

    const res = await fetch(
      `/api/shifts/all?date=${date.toISOString().split("T")[0]}`
    );

    const data = await res.json();
    setShifts(data.shifts || []);

    setLoading(false);
  }

  load();
}, [date]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });

    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-muted/30">

      {/* NAVBAR (kept as you want) */}
      <nav className="border-b bg-background">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock3 className="size-5" />
            </div>
            <span className="text-lg font-semibold">Physioneed</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>
              Dashboard
            </Button>

            <Button variant="default">
              Shifts
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>

        </div>
      </nav>

      {/* CONTENT */}
      <section className="mx-auto w-full max-w-6xl px-6 py-10">

        <Card>

          {/* HEADER WITH DATE FILTER */}
          <CardHeader className="flex flex-row items-center justify-between">

            <CardTitle>Shifts</CardTitle>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="size-4" />
                  {date.toLocaleDateString("en-GB")}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

          </CardHeader>

          {/* TABLE */}
          <CardContent>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Break Start</TableHead>
                  <TableHead>Break End</TableHead>
                  <TableHead>End</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No shifts found for this date.
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{shift.name}</TableCell>
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