import db from "@/lib/db";

export default async function Page() {
  console.log("DB USER:", process.env.DB_USER);
console.log("DB PASS:", process.env.DB_PASSWORD);
  const [rows] = await db.query("SELECT * from users");

  return <pre>{JSON.stringify(rows, null, 2)}</pre>;
}