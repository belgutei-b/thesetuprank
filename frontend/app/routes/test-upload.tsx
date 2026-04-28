import { useState } from "react";
import { getUploadUrl } from "~/api/setup";

export default function TestUpload() {
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Getting upload URL...");
    const res = await getUploadUrl();

    setStatus("Uploading to Azure...");
    // await fetch(uploadUrl, {
    //   method: "PUT",
    //   headers: { "x-ms-blob-type": "BlockBlob" },
    //   body: file,
    // });

    setImageUrl(imageUrl);
    setStatus("Done!");
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <p>{status}</p>
      {imageUrl && <img src={imageUrl} width={200} />}
    </div>
  );
}
