import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/session";

function isAdmin(user) {
  return user?.role?.toLowerCase() === "admin";
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString().split("T")[0];
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate") || startDate;

    if (!isDate(startDate) || !isDate(endDate) || startDate > endDate) {
      return NextResponse.json({ message: "Invalid date range." }, { status: 400 });
    }

    const [rows] = await db.execute(
      `
      SELECT
        users.name,
        users.email,
        shifts.work_date,
        shifts.shift_start,
        shifts.break_start,
        shifts.break_end,
        shifts.shift_end
      FROM shifts
      INNER JOIN users
        ON users.id = shifts.user_id
      WHERE shifts.work_date BETWEEN ? AND ?
      ORDER BY shifts.work_date ASC, shifts.shift_start ASC
      `,
      [startDate, endDate]
    );

    const tableRows = rows
      .map(
        (shift) => `
          <tr>
            <td>${escapeHtml(shift.name)}</td>
            <td>${escapeHtml(shift.email)}</td>
            <td>${escapeHtml(formatDate(shift.work_date))}</td>
            <td>${escapeHtml(formatTime(shift.shift_start))}</td>
            <td>${escapeHtml(formatTime(shift.break_start))}</td>
            <td>${escapeHtml(formatTime(shift.break_end))}</td>
            <td>${escapeHtml(formatTime(shift.shift_end))}</td>
          </tr>
        `
      )
      .join("");

    const workbook = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            table {
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #000000;
              padding: 6px 10px;
            }

            th {
              background-color: #e8e8f8;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Date</th>
                <th>Shift Start</th>
                <th>Break Start</th>
                <th>Break End</th>
                <th>Shift End</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>`;

    return new NextResponse(workbook, {
      headers: {
        "Content-Disposition": `attachment; filename="shifts-${startDate}-to-${endDate}.xls"`,
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to export shifts." },
      { status: 500 }
    );
  }
}
