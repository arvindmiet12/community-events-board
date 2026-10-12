"use client";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import EventCard from "@/components/EventCard";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
const cats = ["Music", "Workshop", "Food", "Sports", "Kids"];
export default function Feed() {
  const [events, setEvents] = useState<any[]>([]),
    [chosen, setChosen] = useState<string[]>([]),
    [loading, setLoading] = useState(true),
    [setup, setSetup] = useState(false),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const token = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  async function load() {
    setLoading(true);
    setError("");
    try {
      const h = { Authorization: `Bearer ${token()}` };
      const [a, b] = await Promise.all([
        fetch("/api/favourites", { headers: h }),
        fetch("/api/feed", { headers: h }),
      ]);
      const ja = await a.json(),
        jb = await b.json();
      if (!a.ok || !b.ok) throw Error(ja.error || jb.error);
      setChosen(ja.categories);
      setEvents(jb.events);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!token()) {
      location.href = "/login";
      return;
    }
    setSetup(new URLSearchParams(location.search).get("setup") === "1");
    load();
  }, []);
  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/favourites", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: chosen }),
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setSetup(false);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <NavBar />
      <main className="page">
        <div className="sectionhead">
          <div>
            <h2>My Feed ✨</h2>
            <p>Upcoming events picked for what you love.</p>
          </div>
          <Button variant="outlined" onClick={() => setSetup(!setup)}>
            Edit interests
          </Button>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {setup && (
          <div className="panel" style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>What are you into?</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              Choose your favourite categories. Your feed updates to match.
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                margin: "16px 0",
              }}
            >
              {cats.map((c) => (
                <FormControlLabel
                  key={c}
                  control={
                    <Checkbox
                      checked={chosen.includes(c)}
                      onChange={(e) =>
                        setChosen((v) =>
                          e.target.checked
                            ? [...v, c]
                            : v.filter((x) => x !== c)
                        )
                      }
                    />
                  }
                  label={c}
                />
              ))}
            </div>
            <Button variant="contained" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save preferences"}
            </Button>
          </div>
        )}
        {loading ? (
          <div className="empty">
            <CircularProgress />
            <p>Personalizing your feed…</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 36 }}>♡</div>
            <h3>Your feed is ready to be yours</h3>
            <p>Choose favourite categories to see upcoming events here.</p>
            <Button variant="contained" onClick={() => setSetup(true)}>
              Choose interests
            </Button>
          </div>
        ) : (
          <div className="eventgrid">
            {events.map((e) => (
              <EventCard key={e.Id} event={e} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
