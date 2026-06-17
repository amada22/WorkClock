import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    // fallback to today if no date sent
    const targetDate = date || new Date().toISOString().split("T")[0];

    const [rows] = await db.execute(
      `
      SELECT
        users.id,
        users.name,
        shifts.work_date,
        shifts.shift_start,
        shifts.break_start,
        shifts.break_end,
        shifts.shift_end
      FROM shifts
      INNER JOIN users
        ON users.id = shifts.user_id
      WHERE shifts.work_date = ?
      ORDER BY shifts.shift_start ASC
      `,
      [targetDate]
    );

    return NextResponse.json({ shifts: rows });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to load shifts." },
      { status: 500 }
    );
  }
}