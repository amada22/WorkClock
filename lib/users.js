import db from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function createUser({ name, email, password }) {
  const passwordHash = hashPassword(password);
  const [result] = await db.execute(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  return getUserById(result.insertId);
}

export async function getUserByEmail(email) {
  const [rows] = await db.execute(
    "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] ?? null;
}

export async function getUserById(id) {
  const [rows] = await db.execute(
    "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0] ?? null;
}

export async function updateUser(id, { name, email, password }) {
  const updates = [];
  const values = [];

  if (name) {
    updates.push("name = ?");
    values.push(name);
  }

  if (email) {
    updates.push("email = ?");
    values.push(email);
  }

  if (password) {
    updates.push("password = ?");
    values.push(hashPassword(password));
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  values.push(id);

  await db.execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

  return getUserById(id);
}

export async function deleteUser(id) {
  const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

  return result.affectedRows > 0;
}
