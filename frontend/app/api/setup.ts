// POST/GET/DELETE /api/setups, /save/{id}, /upload-url

export function getSetups() {}
export function createSetup() {}

export async function getUploadUrl() {
  const res = await fetch("http://localhost:5065/api/setups/upload-url", {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  if (!res.ok) {
    throw new Error("Unexpected error occurred");
  }

  const { uploadUrl, imageUrl } = await res.json();
  return {
    uploadUrl,
    imageUrl,
  };
}

export function deleteSetup() {}
