"use client";
import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import EventCard from "@/components/EventCard";
import { Button, CircularProgress } from "@mui/material";
const categories = ["Music", "Workshop", "Food", "Sports", "Kids"];
export default function Home() {
  const [events, setEvents] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [category, setCategory] = useState("All categories"),
    [city, setCity] = useState("All cities"),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1);
  useEffect(() => {
    fetch("/api/events")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error || "Could not load events");
        setEvents(j.events || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const cities = useMemo(
    () => [
      "All cities",
      ...Array.from(new Set(events.map((e) => e.City || e.city))).sort(),
    ],
    [events]
  );
  const filtered = events.filter(
    (e) =>
      (category === "All categories" ||
        (e.Category || e.category) === category) &&
      (city === "All cities" || (e.City || e.city) === city) &&
      `${e.Title || e.title} ${e.Description || e.description} ${
        e.City || e.city
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  return (
    <>
      <NavBar />
      <section className="hero">
        <h1>Community Events Board</h1>
        <p>Discover, join and be part of amazing events in your community.</p>
        <div className="searchbox">
          <span style={{ padding: "12px 8px 12px 12px", color: "#62718a" }}>
            ⌕
          </span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search events, cities, experiences..."
          />
          <Button variant="contained" onClick={() => setPage(1)}>
            Search
          </Button>
        </div>
      </section>
      <main className="page">
        <div className="filterbar">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option>All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
          >
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <span style={{ alignSelf: "center", fontSize: 12, color: "#60718e" }}>
            Upcoming events · nearest date first
          </span>
        </div>
        <div className="sectionhead">
          <div>
            <h2>Upcoming Events</h2>
            <p>{filtered.length} events to explore</p>
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            Showing {filtered.length ? (page - 1) * 8 + 1 : 0}–
            {Math.min(page * 8, filtered.length)} of {filtered.length}
          </span>
        </div>
        {loading ? (
          <div className="empty">
            <CircularProgress />
            <p>Finding events near you…</p>
          </div>
        ) : error ? (
          <div className="empty">
            Couldn’t load events. {error}
            <p>Check your SQL Server connection and try again.</p>
            <Button onClick={() => location.reload()}>Try again</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 36 }}>✦</div>
            <h3>No events match just yet</h3>
            <p>Try another category, city or search term.</p>
            <Button
              onClick={() => {
                setCategory("All categories");
                setCity("All cities");
                setSearch("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="eventgrid">
              {filtered.slice((page - 1) * 8, page * 8).map((e) => (
                <EventCard key={e.Id || e.id} event={e} />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 26,
              }}
            >
              <Button
                disabled={page === 1}
                variant="outlined"
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span style={{ alignSelf: "center", fontSize: 13 }}>
                Page {page} of {pages}
              </span>
              <Button
                disabled={page >= pages}
                variant="outlined"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
