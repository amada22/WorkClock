export default async function Page() {
  const db = (await import("@/lib/db")).default;

  const [rows] = await db.query("SELECT * FROM users");

  return (
    <pre>{JSON.stringify(rows, null, 2)}</pre>
  );
}
