import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/session";
import { getUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";

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

    // ✅ prevent crash if user or password missing
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    let isValid;

    try {
      isValid = user.password.startsWith("$2")
        ? await bcrypt.compare(password, user.password)
        : verifyPassword(password, user.password);
    } catch (err) {
      console.error("password verify error:", err);
      return NextResponse.json(
        { message: "Login error. Please try again." },
        { status: 500 }
      );
    }

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
    console.error("LOGIN API ERROR:", error);

    return NextResponse.json(
      { message: "Could not login." },
      { status: 500 }
    );
  }
}
