import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
const secret = () => process.env.JWT_SECRET || "development-only-change-me";
export function signToken(payload: object) {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}
export function verifyToken(token: string): any {
  return jwt.verify(token, secret());
}
export function tokenFrom(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : "";
}
export function userFrom(req: NextRequest) {
  const t = tokenFrom(req);
  if (!t) return null;
  try {
    return verifyToken(t);
  } catch {
    return null;
  }
}
export function adminFrom(req: NextRequest) {
  const u = userFrom(req);
  return u?.role === "admin" ? u : null;
}
