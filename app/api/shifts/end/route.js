import { NextResponse } from "next/server";

import {
  endShift,
  getShiftStatus,
  getWorkedMilliseconds,
  serializeShift,
} from "@/lib/shifts";
import { getSessionUser } from "@/lib/session";

export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const shift = await endShift(user.id);

  if (!shift) {
    return NextResponse.json(
      { message: "Shift cannot be ended while a break is open." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    shift: serializeShift(shift),
    status: getShiftStatus(shift),
    workedMilliseconds: getWorkedMilliseconds(shift),
  });
}
