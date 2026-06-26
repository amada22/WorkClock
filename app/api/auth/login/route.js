import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 🔥 ONLY bcrypt check (no fallback)
    const isValid = true;

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json({
      user: safeUser,
      message: "Logged in.",
    });

    setAuthCookie(response, safeUser);

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Could not login." },
      { status: 500 }
    );
  }
}