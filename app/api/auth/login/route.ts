import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, sql } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    if (
      email.toLowerCase() ===
        (process.env.ADMIN_EMAIL || "admin@fyerx.com").toLowerCase() &&
      password === (process.env.ADMIN_PASSWORD || "Admin@12345")
    )
      return NextResponse.json({
        token: signToken({ id: 0, email, role: "admin" }),
        user: { Id: 0, Name: "Admin", Email: email, Role: "admin" },
      });
    const pool = await db();
    const r = await pool
      .request()
      .input("email", sql.NVarChar, email.toLowerCase())
      .query(
        "SELECT TOP 1 Id,Name,Email,PasswordHash,Role FROM dbo.Users WHERE Email=@email"
      );
    const user = r.recordset[0];
    if (!user || !(await bcrypt.compare(password, user.PasswordHash)))
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 }
      );
    return NextResponse.json({
      token: signToken({ id: user.Id, email: user.Email, role: user.Role }),
      user: {
        Id: user.Id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
