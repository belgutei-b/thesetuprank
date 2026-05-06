import type { ApiSetupListItem } from "~/api/types";

export async function saveSetup(setupId: string): Promise<void> {
  const res = await fetch(`/api/saves/${setupId}`, {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 409) throw new Error("already_saved");
  if (res.status === 401) throw new Error("unauthenticated");
  if (!res.ok) throw new Error("failed");
}

export async function getSavedSetups(): Promise<ApiSetupListItem[]> {
  const res = await fetch("/api/saves", { credentials: "include" });
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export async function unsaveSetup(setupId: string): Promise<void> {
  const res = await fetch(`/api/saves/${setupId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("failed");
}
