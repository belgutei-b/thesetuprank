import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { createSetup } from "~/api/setup";
import PhotoPicker from "~/components/setup/PhotoPicker";
import { Button } from "~/components/ui/button";
import toast from "react-hot-toast";

type Status = "idle" | "uploading" | "success" | "error";

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 400;

export default function Upload() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Hooks stay above the early returns below: React needs the same hooks,
  // in the same order, on every render
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    // the sign-in page reads this state to explain why the user landed there
    return <Navigate to="/sign-in" replace state={{ reason: "upload" }} />;
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please add at least one photo.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a setup name.");
      return;
    }

    setStatus("uploading");

    try {
      // Sending the images to the backend server
      // creates the setup
      await createSetup({
        name,
        description,
        files,
      });
      setStatus("success");
      toast.success("Successfully added");
      navigate("/profile");
    } catch (err) {
      setStatus("error");
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 px-4 sm:px-12 max-w-xl mx-auto"
    >
      <h2
        className="text-xs uppercase tracking-widest"
        style={{ color: "var(--color-muted)" }}
      >
        Add Setup
      </h2>

      <PhotoPicker onChange={setFiles} />

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
        <div className="flex justify-between">
          <label
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            Short Description
          </label>
          <span
            className="text-xs"
            style={{
              color:
                description.length >= MAX_DESCRIPTION_LENGTH
                  ? "var(--color-accent)"
                  : "var(--color-muted)",
            }}
          >
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        <textarea
          value={description}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-transparent border px-3 py-2 text-sm outline-none resize-none focus:border-[var(--color-accent)] transition-colors"
          style={{ borderColor: "#333", color: "var(--color-text)" }}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "uploading"}
        className="w-full"
      >
        {status === "uploading" ? "Uploading…" : "Upload Setup →"}
      </Button>
    </form>
  );
}
