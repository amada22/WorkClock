"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

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

function formatTime(value) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShiftsPage() {
  const router = useRouter();
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetch("/api/shifts/all")
      .then((res) => res.json())
      .then(setShifts);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <nav className="border-b bg-background">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock3 className="size-5" />
            </div>

            <span className="text-lg font-semibold">
              Physioneed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              Dashboard
            </Button>

            <Button variant="default">
              Shifts
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Today's Shifts</CardTitle>
          </CardHeader>

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
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>{shift.name}</TableCell>
                    <TableCell>{formatTime(shift.shift_start)}</TableCell>
                    <TableCell>{formatTime(shift.break_start)}</TableCell>
                    <TableCell>{formatTime(shift.break_end)}</TableCell>
                    <TableCell>{formatTime(shift.shift_end)}</TableCell>
                  </TableRow>
                ))}

                {shifts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No shifts found for today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}