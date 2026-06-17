import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute(`
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
      WHERE shifts.work_date = CURDATE()
      ORDER BY shifts.shift_start ASC
    `);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { message: "Failed to load shifts." },
      { status: 500 }
    );
  }
}