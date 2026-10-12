"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

type EventRecord = {
  Id: number;
  Title: string;
  Category: string;
  City: string;
  StartsAt: string;
  Price: number;
  Description: string;
  ImageUrl: string | null;
  IsActive: boolean;
};

type EventForm = {
  title: string;
  category: string;
  city: string;
  startsAt: string;
  price: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const categories = ["Music", "Workshop", "Food", "Sports", "Kids"];
const initialForm: EventForm = {
  title: "",
  category: "Music",
  city: "",
  startsAt: "",
  price: "0",
  description: "",
  imageUrl: "",
  isActive: true,
};

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default function Admin() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [cityFilter, setCityFilter] = useState("All Locations");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuEvent, setMenuEvent] = useState<EventRecord | null>(null);

  const token = () => localStorage.getItem("token") || "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/events", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load events.");
      setEvents(data.events);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token()) {
      location.href = "/login";
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.Role !== "admin") {
        location.href = "/";
        return;
      }
    } catch {
      location.href = "/login";
      return;
    }
    void load();
  }, []);

  const locations = useMemo(
    () => [...new Set(events.map((event) => event.City).filter(Boolean))].sort(),
    [events]
  );
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesQuery =
        !normalizedQuery ||
        [event.Title, event.City, event.Category].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        );
      return (
        matchesQuery &&
        (categoryFilter === "All Categories" || event.Category === categoryFilter) &&
        (cityFilter === "All Locations" || event.City === cityFilter)
      );
    });
  }, [events, query, categoryFilter, cityFilter]);

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(event: EventRecord) {
    setEditing(event);
    setForm({
      title: event.Title,
      category: event.Category,
      city: event.City,
      startsAt: toLocalInput(event.StartsAt),
      price: String(event.Price ?? 0),
      description: event.Description,
      imageUrl: event.ImageUrl || "",
      isActive: Boolean(event.IsActive),
    });
    setError("");
    setMenuAnchor(null);
    setDialogOpen(true);
  }

  async function saveEvent(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/events", {
        method: editing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editing ? { id: editing.Id, ...form } : form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save event.");
      setDialogOpen(false);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save event.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(event: EventRecord) {
    setMenuAnchor(null);
    setError("");
    try {
      const response = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: event.Id, isActive: !event.IsActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update event status.");
      setEvents((current) =>
        current.map((item) =>
          item.Id === event.Id ? { ...item, IsActive: !event.IsActive } : item
        )
      );
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update event status.");
    }
  }

  function updateForm<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <NavBar />
      <main className="manage-page">
        <div className="manage-heading">
          <div>
            <p className="manage-eyebrow">EVENT OPERATIONS</p>
            <h1>Manage Events</h1>
            <p className="manage-subtitle">Create, edit and manage community events.</p>
          </div>
          <Button
            className="create-event-button"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Create Event
          </Button>
        </div>

        {error && !dialogOpen && (
          <Alert severity="error" className="manage-alert" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <section className="manage-table-panel" aria-label="Events">
          <div className="manage-filters">
            <label className="event-search">
              <SearchIcon aria-hidden="true" />
              <input
                aria-label="Search events"
                placeholder="Search events..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <IconButton aria-label="Clear search" size="small" onClick={() => setQuery("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </label>
            <TextField
              select
              size="small"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              inputProps={{ "aria-label": "Filter by category" }}
            >
              <MenuItem value="All Categories">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              inputProps={{ "aria-label": "Filter by location" }}
            >
              <MenuItem value="All Locations">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </TextField>
          </div>

          <div className="manage-table-scroll">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date &amp; Time</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="manage-state"><CircularProgress size={28} /></td></tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="manage-state">
                      <strong>{events.length ? "No matching events" : "No events yet"}</strong>
                      <span>{events.length ? "Try adjusting your search or filters." : "Create an event to populate your board."}</span>
                    </td>
                  </tr>
                ) : filteredEvents.map((event) => {
                  const date = new Date(event.StartsAt);
                  return (
                    <tr key={event.Id}>
                      <td>
                        <div className="manage-event-title">
                          <div
                            className="manage-thumbnail"
                            style={event.ImageUrl ? { backgroundImage: `url("${event.ImageUrl}")` } : undefined}
                            aria-hidden="true"
                          >
                            {!event.ImageUrl && <span>{event.Title.slice(0, 1).toUpperCase()}</span>}
                          </div>
                          <strong>{event.Title}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="manage-date">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="manage-time">
                          {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </td>
                      <td><span className="manage-location">{event.City}</span></td>
                      <td><span className={`manage-category category-${event.Category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{event.Category}</span></td>
                      <td>
                        <span className={`manage-status ${event.IsActive ? "is-published" : "is-draft"}`}>
                          {event.IsActive ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="manage-actions">
                        <Tooltip title="Edit event">
                          <IconButton aria-label={`Edit ${event.Title}`} onClick={() => openEdit(event)} size="small">
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More actions">
                          <IconButton
                            aria-label={`More actions for ${event.Title}`}
                            size="small"
                            onClick={(clickEvent) => {
                              setMenuAnchor(clickEvent.currentTarget);
                              setMenuEvent(event);
                            }}
                          >
                            <MoreHorizIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="manage-table-footer">
              Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
            </div>
          )}
        </section>
      </main>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuEvent && (
          <MenuItem onClick={() => void toggleStatus(menuEvent)}>
            {menuEvent.IsActive ? "Unpublish event" : "Publish event"}
          </MenuItem>
        )}
      </Menu>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={saveEvent}>
          <DialogTitle className="event-dialog-title">
            <span>{editing ? "Edit event" : "Create event"}</span>
            <IconButton aria-label="Close dialog" onClick={() => setDialogOpen(false)} disabled={saving}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="event-dialog-content">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <div className="event-form-grid">
              <TextField label="Event title" value={form.title} onChange={(event) => updateForm("title", event.target.value)} required fullWidth />
              <TextField select label="Category" value={form.category} onChange={(event) => updateForm("category", event.target.value)} fullWidth>
                {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
              </TextField>
              <TextField label="Location" value={form.city} onChange={(event) => updateForm("city", event.target.value)} required fullWidth />
              <TextField label="Date and time" type="datetime-local" value={form.startsAt} onChange={(event) => updateForm("startsAt", event.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Price" type="number" value={form.price} onChange={(event) => updateForm("price", event.target.value)} required fullWidth inputProps={{ min: 0, step: "0.01" }} />
              <TextField label="Image URL" value={form.imageUrl} onChange={(event) => updateForm("imageUrl", event.target.value)} fullWidth />
              <TextField label="Description" value={form.description} onChange={(event) => updateForm("description", event.target.value)} required fullWidth multiline minRows={3} className="event-form-wide" />
              <label className="event-publish-toggle event-form-wide">
                <input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} />
                Publish on community board
              </label>
            </div>
          </DialogContent>
          <DialogActions className="event-dialog-actions">
            <Button onClick={() => setDialogOpen(false)} disabled={saving} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create event"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
