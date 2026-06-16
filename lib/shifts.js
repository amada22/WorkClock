import db from "@/lib/db";

export async function getTodayShift(userId) {
  const [rows] = await db.execute(
    `SELECT id, user_id, work_date, shift_start, break_start, break_end, shift_end
     FROM shifts
     WHERE user_id = ? AND work_date = CURDATE()
     ORDER BY id DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] ?? null;
}

export async function createShift(userId) {
  const [result] = await db.execute(
    `INSERT INTO shifts (user_id, work_date, shift_start)
     VALUES (?, CURDATE(), NOW())`,
    [userId]
  );

  return getShiftById(result.insertId, userId);
}

export async function getShiftById(id, userId) {
  const [rows] = await db.execute(
    `SELECT id, user_id, work_date, shift_start, break_start, break_end, shift_end
     FROM shifts
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [id, userId]
  );

  return rows[0] ?? null;
}

export async function startBreak(userId) {
  const shift = await getTodayShift(userId);

  if (!shift || shift.shift_end || shift.break_start) {
    return null;
  }

  await db.execute(
    `UPDATE shifts
     SET break_start = NOW()
     WHERE id = ? AND user_id = ?`,
    [shift.id, userId]
  );

  return getShiftById(shift.id, userId);
}

export async function endBreak(userId) {
  const shift = await getTodayShift(userId);

  if (!shift || shift.shift_end || !shift.break_start || shift.break_end) {
    return null;
  }

  await db.execute(
    `UPDATE shifts
     SET break_end = NOW()
     WHERE id = ? AND user_id = ?`,
    [shift.id, userId]
  );

  return getShiftById(shift.id, userId);
}

export async function endShift(userId) {
  const shift = await getTodayShift(userId);

  if (!shift || shift.shift_end || (shift.break_start && !shift.break_end)) {
    return null;
  }

  await db.execute(
    `UPDATE shifts
     SET shift_end = NOW()
     WHERE id = ? AND user_id = ?`,
    [shift.id, userId]
  );

  return getShiftById(shift.id, userId);
}

export async function updateShift(id, userId, values) {
  const updates = [];
  const params = [];

  for (const field of ["shift_start", "break_start", "break_end", "shift_end"]) {
    if (field in values) {
      updates.push(`${field} = ?`);
      params.push(values[field]);
    }
  }

  if (updates.length === 0) {
    return getShiftById(id, userId);
  }

  params.push(id, userId);

  await db.execute(
    `UPDATE shifts SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
    params
  );

  return getShiftById(id, userId);
}

export async function deleteShift(id, userId) {
  const [result] = await db.execute(
    "DELETE FROM shifts WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  return result.affectedRows > 0;
}

export function getShiftStatus(shift) {
  if (!shift) {
    return "ready";
  }

  if (shift.shift_end) {
    return "finished";
  }

  if (shift.break_start && !shift.break_end) {
    return "break";
  }

  return "working";
}

export function getWorkedMilliseconds(shift) {
  if (!shift) {
    return 0;
  }

  const shiftStart = new Date(shift.shift_start).getTime();
  const shiftEnd = shift.shift_end ? new Date(shift.shift_end).getTime() : Date.now();
  const breakStart = shift.break_start ? new Date(shift.break_start).getTime() : null;
  const breakEnd = shift.break_end ? new Date(shift.break_end).getTime() : null;
  let breakMilliseconds = 0;

  if (breakStart) {
    breakMilliseconds = (breakEnd ?? Date.now()) - breakStart;
  }

  return Math.max(0, shiftEnd - shiftStart - breakMilliseconds);
}

export function serializeShift(shift) {
  if (!shift) {
    return null;
  }

  return {
    id: shift.id,
    user_id: shift.user_id,
    work_date: shift.work_date,
    shift_start: shift.shift_start?.toISOString?.() ?? shift.shift_start,
    break_start: shift.break_start?.toISOString?.() ?? shift.break_start,
    break_end: shift.break_end?.toISOString?.() ?? shift.break_end,
    shift_end: shift.shift_end?.toISOString?.() ?? shift.shift_end,
  };
}
