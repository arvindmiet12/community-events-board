import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { userFrom } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
export async function GET(req: NextRequest) {
  const u = userFrom(req);
  if (!u)
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const p = await db();
    const r = await p
      .request()
      .input("id", sql.Int, u.id)
      .query("SELECT EventId FROM dbo.Reminders WHERE UserId=@id");
    return NextResponse.json({
      eventIds: r.recordset.map((x: any) => x.EventId),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: NextRequest) {
  const u = userFrom(req);
  if (!u)
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const { eventId, remind } = await req.json();
    const p = await db();
    if (remind) {
      await p
        .request()
        .input("uid", sql.Int, u.id)
        .input("eid", sql.Int, eventId)
        .query(
          "IF NOT EXISTS(SELECT 1 FROM dbo.Reminders WHERE UserId=@uid AND EventId=@eid) INSERT dbo.Reminders(UserId,EventId) VALUES(@uid,@eid)"
        );
    } else
      await p
        .request()
        .input("uid", sql.Int, u.id)
        .input("eid", sql.Int, eventId)
        .query("DELETE FROM dbo.Reminders WHERE UserId=@uid AND EventId=@eid");
    return NextResponse.json({ eventId, remind: !!remind });
  } catch (e) {
    return errorResponse(e);
  }
}
