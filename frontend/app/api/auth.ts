import type { ApiUser } from "~/api/types";

export async function getMe() {
  // vite proxy changes /api/auth/me
  // http://localhost:5065/api/auth/me
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Unauthenticated user");
  }
  const user: ApiUser = await res.json();
  // todo: need to convert to User type
  return user;
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
}
