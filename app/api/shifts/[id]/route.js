import { NextResponse } from "next/server";

import {
  deleteShift,
  getShiftById,
  getShiftStatus,
  getWorkedMilliseconds,
  serializeShift,
  updateShift,
} from "@/lib/shifts";
import { getSessionUser } from "@/lib/session";

async function getRouteContext(params) {
  const user = await getSessionUser();

  if (!user) {
    return { error: NextResponse.json({ message: "Not authenticated." }, { status: 401 }) };
  }

  const { id } = await params;
  const shiftId = Number(id);

  if (!Number.isInteger(shiftId)) {
    return { error: NextResponse.json({ message: "Invalid shift id." }, { status: 400 }) };
  }

  return { user, shiftId };
}

export async function GET(_request, { params }) {
  const context = await getRouteContext(params);

  if (context.error) {
    return context.error;
  }

  const shift = await getShiftById(context.shiftId, context.user.id);

  if (!shift) {
    return NextResponse.json({ message: "Shift not found." }, { status: 404 });
  }

  return NextResponse.json({
    shift: serializeShift(shift),
    status: getShiftStatus(shift),
    workedMilliseconds: getWorkedMilliseconds(shift),
  });
}

export async function PATCH(request, { params }) {
  const context = await getRouteContext(params);

  if (context.error) {
    return context.error;
  }

  const values = await request.json();
  const shift = await updateShift(context.shiftId, context.user.id, values);

  if (!shift) {
    return NextResponse.json({ message: "Shift not found." }, { status: 404 });
  }

  return NextResponse.json({
    shift: serializeShift(shift),
    status: getShiftStatus(shift),
    workedMilliseconds: getWorkedMilliseconds(shift),
  });
}

export async function DELETE(_request, { params }) {
  const context = await getRouteContext(params);

  if (context.error) {
    return context.error;
  }

  const wasDeleted = await deleteShift(context.shiftId, context.user.id);

  if (!wasDeleted) {
    return NextResponse.json({ message: "Shift not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Shift deleted." });
}
