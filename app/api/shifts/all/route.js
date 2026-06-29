import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/session";

function isAdmin(user) {
  return user?.role?.toLowerCase() === "admin";
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");
}

export async function GET(req) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admins only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const today = new Date().toISOString().split("T")[0];
    const rangeStart = startDate || date || today;
    const rangeEnd = endDate || date || rangeStart;

    if (!isDate(rangeStart) || !isDate(rangeEnd) || rangeStart > rangeEnd) {
      return NextResponse.json({ message: "Invalid date range." }, { status: 400 });
    }

    const [rows] = await db.execute(
      `
      SELECT
        shifts.id,
        users.id AS user_id,
        users.name,
        shifts.work_date,
        shifts.shift_start,
        shifts.break_start,
        shifts.break_end,
        shifts.shift_end,
        shifts.start_latitude,
        shifts.start_longitude
      FROM shifts
      INNER JOIN users
        ON users.id = shifts.user_id
      WHERE shifts.work_date BETWEEN ? AND ?
      ORDER BY shifts.shift_start ASC
      `,
      [rangeStart, rangeEnd]
    );

    return NextResponse.json({ shifts: rows });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to load shifts." },
      { status: 500 }
    );
  }
}
