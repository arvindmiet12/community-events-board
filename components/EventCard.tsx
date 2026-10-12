"use client";
import Link from "next/link";
import { Button } from "@mui/material";
export default function EventCard({ event }: { event: any }) {
  const d = new Date(event.StartsAt || event.startsAt);
  return (
    <article className="eventcard">
      <div
        className="eventimage"
        style={{
          backgroundImage: `url("${event.ImageUrl || event.imageUrl || ""}")`,
        }}
      >
        <div className="datebadge">
          <strong>{d.toLocaleDateString("en-IN", { day: "2-digit" })}</strong>
          {d.toLocaleDateString("en-IN", { month: "short" })}
        </div>
      </div>
      <div className="eventcontent">
        <span className="category">{event.Category || event.category}</span>
        <h3>{event.Title || event.title}</h3>
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
        <div className="meta">⌖ {event.City || event.city}</div>
        <div className="description">
          {event.Description || event.description}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <b>
            ₹{Number(event.Price ?? event.price ?? 0).toLocaleString("en-IN")}
          </b>
          <span className="muted" style={{ fontSize: 11 }}>
            Per person
          </span>
        </div>
        <Link href={`/events/${event.Id || event.id}`}>
          <Button variant="contained">View details</Button>
        </Link>
      </div>
    </article>
  );
}
