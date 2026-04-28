export async function getUploadUrl(): Promise<{ uploadUrl: string; imageUrl: string }> {
  const res = await fetch("/api/setups/upload-url", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json();
}

export async function uploadImageToAzure(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "x-ms-blob-type": "BlockBlob" },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload image");
}

export async function createSetup(imageUrl: string, description: string): Promise<void> {
  const res = await fetch("/api/setups", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, description }),
  });
  if (!res.ok) throw new Error("Failed to create setup");
}

export function getSetups() {}
export function deleteSetup() {}
