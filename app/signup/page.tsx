"use client";
import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { Button, TextField, Alert } from "@mui/material";
export default function Signup() {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      console.log("Signup API called");
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

     // console.log("Signup API called", { body: JSON.stringify({ name, email, password }) });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      localStorage.setItem("token", j.token);
      localStorage.setItem("user", JSON.stringify(j.user));
      location.href = "/feed?setup=1";
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
          <h1 style={{ fontSize: 26, margin: "0 0 8px" }}>
            Join your community
          </h1>
          <p className="muted" style={{ fontSize: 13, marginBottom: 24 }}>
            Create an account to build your personal event feed.
          </p>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
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
            label="Password (8+ characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ minLength: 8 }}
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
            {busy ? "Creating account…" : "Create account"}
          </Button>
          <p
            className="muted"
            style={{ fontSize: 13, textAlign: "center", marginTop: 20 }}
          >
            Already registered?{" "}
            <Link href="/login" style={{ color: "#6045ff", fontWeight: 700 }}>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
