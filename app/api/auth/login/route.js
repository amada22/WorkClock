import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/password";
import { setAuthCookie } from "@/lib/session";
import { getUserByEmail } from "@/lib/users";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(cleanEmail);

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "Employee",
    };
    const response = NextResponse.json({
      user: safeUser,
      message: "Logged in.",
    });

    setAuthCookie(response, safeUser);

    return response;
  } catch {
    return NextResponse.json({ message: "Could not login." }, { status: 500 });
  }
}
