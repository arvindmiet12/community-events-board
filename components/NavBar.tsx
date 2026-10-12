"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
export default function NavBar() {
  const [logged, setLogged] = useState(false);
  useEffect(() => setLogged(!!localStorage.getItem("token")), []);
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark">F</span> FyerX
      </Link>
      <nav className="navlinks">
        <Link href="/">Home</Link>
        <Link href="/">Events</Link>
        {/* <Link href="/#about">About</Link> */}
      </nav>
      <div className="navright">
        {logged ? (
          <>
            <Link href="/feed">
              <Button color="inherit" size="small">
                My Feed
              </Button>
            </Link>
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                location.href = "/";
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button color="inherit" size="small" className="desktop">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="contained" size="small">
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
