import { NextResponse } from "next/server";

import {
  createShift,
  getShiftStatus,
  getTodayShift,
  getWorkedMilliseconds,
  serializeShift,
} from "@/lib/shifts";

import { getSessionUser } from "@/lib/session";

export async function POST(request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const existingShift = await getTodayShift(user.id);

    if (existingShift) {
      return NextResponse.json(
        { message: "You already have a shift for today." },
        { status: 409 }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { latitude = null, longitude = null } = body;

    const shift = await createShift(user.id, latitude, longitude);

    return NextResponse.json({
      shift: serializeShift(shift),
      status: getShiftStatus(shift),
      workedMilliseconds: getWorkedMilliseconds(shift),
    });
  } catch (error) {
    console.error("SHIFT START ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}