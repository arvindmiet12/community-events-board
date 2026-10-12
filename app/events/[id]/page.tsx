"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { Alert, Button, CircularProgress } from "@mui/material";
const themes = [
    { id: "midnight", bg: "linear-gradient(135deg,#17294a,#6045ff)" },
    { id: "sunset", bg: "linear-gradient(135deg,#f97316,#d9468c)" },
    { id: "mint", bg: "linear-gradient(135deg,#087f8c,#13c5a5)" },
  ],
  stickers = ["✨", "🎵", "🎉", "❤️", "🌟"];
export default function EventDetail() {
  const params = useParams(),
    id = String(params.id);
  const [event, setEvent] = useState<any>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [remind, setRemind] = useState(false),
    [theme, setTheme] = useState("midnight"),
    [chosen, setChosen] = useState<string[]>([]),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  const token = () => localStorage.getItem("token") || "";
  useEffect(() => {
    fetch("/api/events?limit=50")
      .then((r) => r.json())
      .then((j) =>
        setEvent((j.events || []).find((e: any) => String(e.Id) === id))
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    if (localStorage.getItem("token")) {
      const h = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      fetch("/api/reminders", { headers: h })
        .then((r) => r.json())
        .then((j) => setRemind((j.eventIds || []).includes(Number(id))));
      fetch(`/api/card-design?eventId=${id}`, { headers: h })
        .then((r) => r.json())
        .then((j) => {
          if (j.design) {
            setTheme(j.design.theme);
            setChosen(j.design.stickers);
          }
        })
        .catch(() => {});
    }
  }, [id]);
  async function toggleReminder() {
    if (!token()) {
      location.href = "/login";
      return;
    }
    const prev = remind;
    setRemind(!prev);
    setMessage("");
    try {
      const r = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: Number(id), remind: !prev }),
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setMessage(
        !prev
          ? "Reminder saved. We’ll keep this event on your radar."
          : "Reminder removed."
      );
    } catch (e: any) {
      setRemind(prev);
      setMessage(`Could not save reminder: ${e.message}`);
    }
  }
  async function saveDesign() {
    if (!token()) {
      location.href = "/login";
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const r = await fetch("/api/card-design", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId: Number(id), theme, stickers: chosen }),
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setMessage("Your card design is saved.");
    } catch (e: any) {
      setMessage(`Could not save design: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <>
        <NavBar />
        <div className="empty">
          <CircularProgress />
          <p>Loading event…</p>
        </div>
      </>
    );
  if (!event)
    return (
      <>
        <NavBar />
        <div className="page">
          <Alert severity="error">
            {error || "Event not found. It may be inactive or past."}
          </Alert>
          <Link href="/">← Back to events</Link>
        </div>
      </>
    );
  const d = new Date(event.StartsAt);
  return (
    <>
      <NavBar />
      <main className="page">
        <p style={{ fontSize: 13, marginBottom: 20 }}>
          <Link href="/">← Back to events</Link>
        </p>
        <div className="eventdetail">
          <div>
            <div
              className="detailhero"
              style={{ backgroundImage: `url("${event.ImageUrl}")` }}
            >
              <div className="datebadge">
                <strong>
                  {d.toLocaleDateString("en-IN", { day: "2-digit" })}
                </strong>
                {d.toLocaleDateString("en-IN", { month: "short" })}
              </div>
            </div>
            <div className="panel" style={{ marginTop: 18 }}>
              <h3>Event details</h3>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.8 }}>
                {event.Description}
              </p>
              <div className="meta">
                ◷{" "}
                {d.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                ,{" "}
                {d.toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
              <div className="meta">⌖ {event.City}</div>
              <div className="meta">▦ {event.Category}</div>
            </div>
          </div>
          <aside className="detailpanel">
            <span className="category">{event.Category}</span>
            <h1 style={{ fontSize: 27, margin: "4px 0 14px" }}>
              {event.Title}
            </h1>
            <div className="meta">
              ◷{" "}
              {d.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
            <div className="meta">⌖ {event.City}</div>
            <h2 style={{ margin: "22px 0" }}>
              ₹{Number(event.Price).toLocaleString("en-IN")}{" "}
              <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>
                {" "}
                / person
              </span>
            </h2>
            <Button fullWidth variant="contained" onClick={toggleReminder}>
              {remind ? "✓ Reminder set" : "♧ Remind me"}
            </Button>
            {message && (
              <Alert
                severity={
                  message.toLowerCase().includes("could not")
                    ? "error"
                    : "success"
                }
                sx={{ mt: 2 }}
              >
                {message}
              </Alert>
            )}
            <p className="muted" style={{ fontSize: 11, lineHeight: 1.6 }}>
              Sign in to save reminders and personalize your event card.
            </p>
          </aside>
        </div>
        <div className="panel" style={{ marginTop: 24 }}>
          <div className="sectionhead">
            <div>
              <h2>Design your card</h2>
              <p>Make this event feel like yours. Changes preview instantly.</p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 22,
            }}
          >
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>Background theme</p>
              <div className="designrow">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    aria-label={t.id}
                    className={`themechip ${theme === t.id ? "selected" : ""}`}
                    style={{ background: t.bg }}
                    onClick={() => setTheme(t.id)}
                  />
                ))}
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, marginTop: 24 }}>
                Add stickers · up to 3
              </p>
              <div className="stickers">
                {stickers.map((s) => (
                  <button
                    className="stickerbtn"
                    key={s}
                    onClick={() =>
                      setChosen((v) =>
                        v.includes(s)
                          ? v.filter((x) => x !== s)
                          : v.length < 3
                          ? [...v, s]
                          : v
                      )
                    }
                    style={{
                      outline: chosen.includes(s)
                        ? "2px solid #6045ff"
                        : undefined,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {chosen.map((s) => (
                  <Button
                    key={s}
                    size="small"
                    variant="outlined"
                    onClick={() => setChosen((v) => v.filter((x) => x !== s))}
                  >
                    Remove {s} ×
                  </Button>
                ))}
              </div>
              <Button
                sx={{ mt: 3 }}
                variant="contained"
                onClick={saveDesign}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save design"}
              </Button>
            </div>
            <div className={`designed-card theme-${theme}`}>
              <span style={{ fontSize: 11, opacity: 0.8 }}>
                FYERX COMMUNITY PRESENTS
              </span>
              <div className="design-stickers">
                {chosen.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    style={{ animation: "pop .25s ease" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <h2 style={{ fontSize: 25, margin: "12px 0 8px" }}>
                {event.Title}
              </h2>
              <p style={{ fontSize: 13, opacity: 0.9 }}>
                {event.City} ·{" "}
                {d.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <p style={{ fontSize: 11, opacity: 0.75 }}>
                A moment worth sharing.
              </p>
            </div>
          </div>
        </div>
      </main>
      <style
        jsx
      >{`@keyframes pop{from{transform:scale(.5);opacity:.2}to{transform:scale(1);opacity:1}}`}</style>
    </>
  );
}
