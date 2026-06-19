import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT id, name, email, role FROM users");

    return Response.json({
      success: true,
      count: rows.length,
      users: rows,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}