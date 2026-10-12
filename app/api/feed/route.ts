import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { userFrom } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
export async function GET(req: NextRequest) {
  const u = userFrom(req);
  if (!u)
    return NextResponse.json(
      { error: "Please log in to view your feed." },
      { status: 401 }
    );
  try {
    const p = await db();
    const r = await p
      .request()
      .input("id", sql.Int, u.id)
      .input("now", sql.DateTime2, new Date())
      .query(
        "SELECT e.* FROM dbo.Events e INNER JOIN dbo.UserFavourites f ON f.Category=e.Category AND f.UserId=@id WHERE e.IsActive=1 AND e.StartsAt>@now ORDER BY e.StartsAt ASC"
      );
    return NextResponse.json({ events: r.recordset });
  } catch (e) {
    return errorResponse(e);
  }
}
