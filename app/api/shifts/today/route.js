import { NextResponse } from "next/server";

import {
  getShiftStatus,
  getTodayShift,
  getWorkedMilliseconds,
  serializeShift,
} from "@/lib/shifts";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const shift = await getTodayShift(user.id);

  return NextResponse.json({
    shift: serializeShift(shift),
    status: getShiftStatus(shift),
    workedMilliseconds: getWorkedMilliseconds(shift),
  });
}
