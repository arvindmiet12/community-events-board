import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { userFrom } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
const themes = ["midnight", "sunset", "mint"],
  stickers = ["✨", "🎵", "🎉", "❤️", "🌟"];
export async function GET(req: NextRequest) {
  const u = userFrom(req);
  if (!u)
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const eventId = Number(req.nextUrl.searchParams.get("eventId"));
  if (!eventId)
    return NextResponse.json(
      { error: "eventId is required." },
      { status: 400 }
    );
  try {
    const p = await db();
    const r = await p
      .request()
      .input("uid", sql.Int, u.id)
      .input("eid", sql.Int, eventId)
      .query(
        "SELECT Theme,Stickers FROM dbo.CardDesigns WHERE UserId=@uid AND EventId=@eid"
      );
    return NextResponse.json({
      design: r.recordset[0]
        ? {
            theme: r.recordset[0].Theme,
            stickers: JSON.parse(r.recordset[0].Stickers),
          }
        : { theme: "midnight", stickers: [] },
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
    const { eventId, theme, stickers: chosen } = await req.json();
    if (
      !eventId ||
      !themes.includes(theme) ||
      !Array.isArray(chosen) ||
      chosen.length > 3 ||
      chosen.some((s: string) => !stickers.includes(s))
    )
      return NextResponse.json(
        { error: "Choose a valid theme and up to three stickers." },
        { status: 400 }
      );
    const p = await db();
    await p
      .request()
      .input("uid", sql.Int, u.id)
      .input("eid", sql.Int, eventId)
      .input("theme", sql.NVarChar, theme)
      .input("stickers", sql.NVarChar, JSON.stringify(chosen))
      .query(
        "MERGE dbo.CardDesigns AS t USING (SELECT @uid UserId,@eid EventId) s ON t.UserId=s.UserId AND t.EventId=s.EventId WHEN MATCHED THEN UPDATE SET Theme=@theme,Stickers=@stickers,UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT(UserId,EventId,Theme,Stickers) VALUES(@uid,@eid,@theme,@stickers);"
      );
    return NextResponse.json({ design: { theme, stickers: chosen } });
  } catch (e) {
    return errorResponse(e);
  }
}
