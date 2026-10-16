import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { reportSetup } from "~/api/setup";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

type Status = "idle" | "sending" | "sent";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupId: string;
  name: string;
  onReported: () => void;
  onSkip: () => void;
};

export default function ReportDialog({
  open,
  onOpenChange,
  setupId,
  name,
  onReported,
  onSkip,
}: Props) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Start fresh every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setMessage("");
    setStatus("idle");
  }, [open]);

  async function handleSubmit() {
    if (status !== "idle") return;
    setStatus("sending");
    try {
      await reportSetup(setupId, message.trim() || undefined);
      setStatus("sent");
      onReported();
    } catch {
      setStatus("idle");
      toast.error("Failed to submit report");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-32px)] gap-[18px] overflow-y-auto rounded-sm p-6 sm:max-w-[460px]">
        {status === "sent" ? (
          <>
            <p className="text-[11px] uppercase tracking-[2px] text-accent">
              Report sent
            </p>
            <DialogTitle className="font-serif text-[22px] font-semibold leading-tight">
              Thanks. We’ll take a look
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-dim">
              Your report on “{name}” was sent. You can keep voting on this
              pair, or skip it.
            </DialogDescription>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onSkip();
                }}
              >
                Skip this pair
              </Button>
              <DialogClose render={<Button variant="outline" />}>
                Back to voting
              </DialogClose>
            </div>
          </>
        ) : (
          <>
            <div className="pr-8">
              <p className="text-[11px] uppercase tracking-[2px] text-danger">
                Report setup
              </p>
              <DialogTitle className="mt-1.5 font-serif text-[22px] font-semibold leading-tight">
                {name}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm leading-normal text-dim">
                Reports are anonymous.
              </DialogDescription>
            </div>

            <label className="flex flex-col gap-1.5 text-[13px] text-dim">
              What’s wrong with it? (optional)
              <Textarea
                rows={3}
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-20 resize-y rounded-xs text-sm text-text"
              />
            </label>

            <div className="flex flex-wrap justify-end gap-2">
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleSubmit} disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send report"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
