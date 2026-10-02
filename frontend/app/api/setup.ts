import type { ApiSetupListItem } from "./types";

export async function getUploadUrl(): Promise<{
  uploadUrl: string;
  imageUrl: string;
}> {
  const res = await fetch("/api/setups/upload-url", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json();
}

export async function uploadImageToAzure(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "x-ms-blob-type": "BlockBlob" },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload image");
}

export async function createSetup(setup: {
  name: string;
  file: File;
  description: string;
}): Promise<void> {
  const res = await fetch("/api/setups", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(setup),
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
