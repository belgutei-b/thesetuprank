import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { createSetup, getUploadUrl, uploadImageToAzure } from "~/api/setup";

type Status = "idle" | "uploading" | "success" | "error";

const MAX_NAME_LENGTH = 20;
const MAX_FILE_SIZE_MB = 10;

export default function Submit() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    // toast message
    navigate("/sign-in");
  }

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setErrorMessage("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!imageFile) {
      setErrorMessage("Please select a photo.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Please enter a setup name.");
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    try {
      const { uploadUrl, imageUrl } = await getUploadUrl();
      await uploadImageToAzure(uploadUrl, imageFile);
      await createSetup(imageUrl, description);
      setStatus("success");
      navigate("/profile");
    } catch (err) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  if (isLoading) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 px-12 max-w-xl mx-auto"
    >
      <h2
        className="text-xs uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        Add Setup
      </h2>

      {/* Image upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center h-40 border border-dashed cursor-pointer transition-colors"
        style={{
          borderColor: isDragging ? "var(--color-accent)" : "#333",
          backgroundColor: isDragging ? "#161616" : "transparent",
        }}
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--color-text)" }}
            >
              Drag & Drop or Click
            </p>
            <p
              className="mt-1 text-xs uppercase tracking-widest"
              style={{ color: "var(--color-muted)" }}
            >
              JPG, PNG · Max 10MB
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* Setup name */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <label
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            Setup Name
          </label>
          <span
            className="text-xs"
            style={{
              color:
                name.length >= MAX_NAME_LENGTH
                  ? "var(--color-accent)"
                  : "var(--color-muted)",
            }}
          >
            {name.length}/{MAX_NAME_LENGTH}
          </span>
        </div>
        <input
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
          style={{ borderColor: "#333", color: "var(--color-text)" }}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Short Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-transparent border px-3 py-2 text-sm outline-none resize-none focus:border-[var(--color-accent)] transition-colors"
          style={{ borderColor: "#333", color: "var(--color-text)" }}
        />
      </div>

      {errorMessage && (
        <p className="text-xs" style={{ color: "#e57373" }}>
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "uploading"}
        className="w-full py-3 text-xs uppercase tracking-widest transition-opacity disabled:opacity-50"
        style={{
          backgroundColor: "var(--color-text)",
          color: "var(--color-bg)",
        }}
      >
        {status === "uploading" ? "Uploading…" : "Submit Setup →"}
      </button>
    </form>
  );
}
