import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, sql } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (
      !name?.trim() ||
      !email ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !password ||
      password.length < 8
    )
      return NextResponse.json(
        {
          error:
            "Enter your name, a valid email and a password of at least 8 characters.",
        },
        { status: 400 }
      );
    const pool = await db();
    const hash = await bcrypt.hash(password, 12);
    const r = await pool
      .request()
      .input("name", sql.NVarChar, name.trim())
      .input("email", sql.NVarChar, email.toLowerCase())
      .input("hash", sql.NVarChar, hash)
      .query(
        "INSERT dbo.Users(Name,Email,PasswordHash) OUTPUT INSERTED.Id,INSERTED.Name,INSERTED.Email,INSERTED.Role VALUES(@name,@email,@hash)"
      );
    const user = r.recordset[0];
    return NextResponse.json(
      {
        token: signToken({ id: user.Id, email: user.Email, role: user.Role }),
        user,
      },
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.number === 2627 || e?.number === 2601)
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    return errorResponse(e);
  }
}
