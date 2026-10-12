"use client";
import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { Button, TextField, Alert } from "@mui/material";
export default function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      localStorage.setItem("token", j.token);
      localStorage.setItem("user", JSON.stringify(j.user));
      location.href = j.user.Role === "admin" ? "/admin" : "/feed";
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <NavBar />
      <div className="authwrap">
        <form className="authcard" onSubmit={submit}>
          <div className="brand" style={{ color: "#12213d", marginBottom: 18 }}>
            <span className="brand-mark">F</span> Welcome back
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 8px" }}>Log in to FyerX</h1>
          <p className="muted" style={{ fontSize: 13, marginBottom: 24 }}>
            Your next community moment is waiting.
          </p>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={busy}
            size="large"
          >
            {busy ? "Signing in…" : "Log in"}
          </Button>
          <p
            className="muted"
            style={{ fontSize: 13, textAlign: "center", marginTop: 20 }}
          >
            New here?{" "}
            <Link href="/signup" style={{ color: "#6045ff", fontWeight: 700 }}>
              Create an account
            </Link>
          </p>
          <p className="muted" style={{ fontSize: 11 }}>
            Admin demo: admin@fyerx.com / Admin@12345 (change in .env).
          </p>
        </form>
      </div>
    </>
  );
}
