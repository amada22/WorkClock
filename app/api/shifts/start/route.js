import { NextResponse } from "next/server";

import {
  createShift,
  getShiftStatus,
  getTodayShift,
  getWorkedMilliseconds,
  serializeShift,
} from "@/lib/shifts";
import { getSessionUser } from "@/lib/session";

export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const existingShift = await getTodayShift(user.id);

  if (existingShift) {
    return NextResponse.json(
      { message: "You already have a shift for today." },
      { status: 409 }
    );
  }

  const shift = await createShift(user.id);

  return NextResponse.json({
    shift: serializeShift(shift),
    status: getShiftStatus(shift),
    workedMilliseconds: getWorkedMilliseconds(shift),
  });
}
