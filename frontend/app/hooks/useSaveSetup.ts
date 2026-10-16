import { useState } from "react";
import toast from "react-hot-toast";
import { saveSetup, unsaveSetup } from "~/api/saved";

export function useSaveSetup(setupId: string, initialSaved: boolean) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);

  async function toggleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveSetup(setupId);
        setIsSaved(false);
        toast.success("Removed from saves");
      } else {
        await saveSetup(setupId);
        setIsSaved(true);
        toast.success("Successfully saved");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "already_saved") {
        setIsSaved(true);
        toast.success("Successfully saved");
      } else if (msg === "unauthenticated") {
        toast.error("Sign in to save the setup");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return { isSaved, isSaving, toggleSave };
}
