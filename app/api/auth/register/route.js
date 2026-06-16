import { NextResponse } from "next/server";

import { setAuthCookie } from "@/lib/session";
import { createUser, getUserByEmail } from "@/lib/users";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(cleanEmail);

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await createUser({
      name: cleanName,
      email: cleanEmail,
      password,
    });
    const response = NextResponse.json({
      user: { ...user, role: "Employee" },
      message: "Account created.",
    });

    setAuthCookie(response, { ...user, role: "Employee" });

    return response;
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Could not create account." }, { status: 500 });
  }
}
