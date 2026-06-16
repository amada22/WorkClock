import { NextResponse } from "next/server";

import {
  getShiftStatus,
  getWorkedMilliseconds,
  serializeShift,
  startBreak,
} from "@/lib/shifts";
import { getSessionUser } from "@/lib/session";

export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const shift = await startBreak(user.id);

  if (!shift) {
    return NextResponse.json(
      { message: "Break cannot be started right now." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    shift: serializeShift(shift),
    status: getShiftStatus(shift),
    workedMilliseconds: getWorkedMilliseconds(shift),
  });
}
