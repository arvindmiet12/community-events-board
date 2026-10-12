import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { errorResponse } from "@/lib/http";
export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const category = p.get("category") || "",
      city = p.get("city") || "",
      search = p.get("search") || "",
      page = Math.max(1, Number(p.get("page") || 1)),
      limit = Math.min(50, Math.max(1, Number(p.get("limit") || 8)));
    const pool = await db();
    const r = await pool
      .request()
      .input("now", sql.DateTime2, new Date())
      .input("category", sql.NVarChar, category)
      .input("city", sql.NVarChar, city)
      .input("search", sql.NVarChar, `%${search}%`)
      .input("offset", sql.Int, (page - 1) * limit)
      .input("limit", sql.Int, limit)
      .query(
        `SELECT * FROM dbo.Events WHERE IsActive=1 AND StartsAt>@now AND (@category='' OR Category=@category) AND (@city='' OR City=@city) AND (@search='%%' OR Title LIKE @search OR Description LIKE @search OR City LIKE @search) ORDER BY StartsAt ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY; SELECT COUNT(*) AS total FROM dbo.Events WHERE IsActive=1 AND StartsAt>@now AND (@category='' OR Category=@category) AND (@city='' OR City=@city) AND (@search='%%' OR Title LIKE @search OR Description LIKE @search OR City LIKE @search); SELECT DISTINCT City FROM dbo.Events WHERE IsActive=1 AND StartsAt>@now ORDER BY City;`
      );
    return NextResponse.json({
      events: r.recordsets[0],
      total: r.recordsets[1][0].total,
      page,
      limit,
      cities: r.recordsets[2].map((x: any) => x.City),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
