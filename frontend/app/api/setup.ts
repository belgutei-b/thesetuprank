import type { ApiSetupListItem } from "./types";

export async function createSetup(setup: {
  name: string;
  // in display order: the first one is the cover
  files: File[];
  description: string;
}): Promise<void> {
  const formData = new FormData();
  formData.append('name', setup.name);
  formData.append('description', setup.description);
  // one `setupImages` entry per file. The order is kept, so the backend can
  // bind them to a List<IFormFile> SetupImages
  for (const file of setup.files) {
    formData.append('setupImages', file);
  }

  const res = await fetch("/api/setups", {
    method: "POST",
    credentials: "include",
    // headers: { "Content-Type": "application/json" },
    body: formData,
  });

  // issue with users input
  if (res.status === 400) {
    const tmp = await res.json() as string;
    throw new Error(tmp);
  }

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

export async function reportSetup(
  setupId: string,
  message?: string,
): Promise<void> {
  const res = await fetch(`/api/setups/report/${setupId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // TODO: the backend ignores the body for now and only counts reports
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to report setup");
}
