import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { userFrom } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
const allowed = ["Music", "Workshop", "Food", "Sports", "Kids"];
export async function GET(req: NextRequest) {
  const u = userFrom(req);
  if (!u)
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const p = await db();
    const r = await p
      .request()
      .input("id", sql.Int, u.id)
      .query("SELECT Category FROM dbo.UserFavourites WHERE UserId=@id");
    return NextResponse.json({
      categories: r.recordset.map((x: any) => x.Category),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PUT(req: NextRequest) {
  const u = userFrom(req);
  if (!u)
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const { categories } = await req.json();
    if (
      !Array.isArray(categories) ||
      categories.some((x: string) => !allowed.includes(x))
    )
      return NextResponse.json(
        { error: "Choose valid categories." },
        { status: 400 }
      );
    const p = await db(),
      tx = new sql.Transaction(p);
    await tx.begin();
    try {
      await new sql.Request(tx)
        .input("id", sql.Int, u.id)
        .query("DELETE FROM dbo.UserFavourites WHERE UserId=@id");
      for (const c of [...new Set(categories)])
        await new sql.Request(tx)
          .input("id", sql.Int, u.id)
          .input("category", sql.NVarChar, c)
          .query(
            "INSERT dbo.UserFavourites(UserId,Category) VALUES(@id,@category)"
          );
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
    return NextResponse.json({ categories: [...new Set(categories)] });
  } catch (e) {
    return errorResponse(e);
  }
}
