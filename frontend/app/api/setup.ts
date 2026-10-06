import type { ApiSetupListItem } from "./types";

export async function createSetup(setup: {
  name: string;
  file: File;
  description: string;
}): Promise<void> {
  const formData = new FormData();
  formData.append('name', setup.name);
  formData.append('description', setup.description);
  formData.append('setupImage', setup.file);

  const res = await fetch("/api/setups", {
    method: "POST",
    credentials: "include",
    // headers: { "Content-Type": "application/json" },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create setup");
}

export async function getSetups(): Promise<ApiSetupListItem[]> {
  const res = await fetch("/api/setups", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch setups");
  return res.json();
}

export async function getRanking(): Promise<{
  numberOfSetups: number;
  setups: ApiSetupListItem[];
}> {
  const res = await fetch("/api/ranking");
  if (!res.ok) throw new Error("Failed to fetch ranking");
  return res.json();
}

export function deleteSetup() { }

export async function reportSetup(setupId: string): Promise<void> {
  const res = await fetch(`/api/setups/report/${setupId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to report setup");
}
