import { Bookmark, Flag, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  photos: string[];
  isSaved: boolean;
  isSaving: boolean;
  onToggleSave: () => void;
  isReported: boolean;
  onReport: () => void;
};

// A bottom sheet on phones, a centered dialog on bigger screens
export default function SetupDetailsDialog({
  open,
  onOpenChange,
  name,
  description,
  photos,
  isSaved,
  isSaving,
  onToggleSave,
  isReported,
  onReport,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-auto bottom-0 left-0 block max-h-[88vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none rounded-t-xl border-t border-line-strong bg-surface px-4 pt-2 pb-6 text-text ring-0 sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100vw-32px)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-sm sm:border sm:px-6 sm:pt-5"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-2 h-1 w-9 rounded-full bg-line-strong sm:hidden"
        />
        <div className="flex items-center gap-2">
          <DialogTitle className="min-w-0 flex-1 text-[22px] font-semibold leading-tight">
            {name}
          </DialogTitle>
          <DialogClose
            aria-label="Close"
            render={<Button variant="ghost" size="icon" className="-mr-2.5" />}
          >
            <X size={18} />
          </DialogClose>
        </div>
        <DialogDescription className="mt-2 mb-4 text-sm leading-relaxed text-zinc-300">
          {description}
        </DialogDescription>

        <div className="flex flex-col gap-2">
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${name}, photo ${i + 1} of ${photos.length}`}
              className="h-auto w-full bg-bg"
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={onToggleSave}
            disabled={isSaving}
            aria-pressed={isSaved}
            className="flex-1"
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved" : "Save"}
          </Button>
          {isReported ? (
            <span className="inline-flex h-11 shrink-0 items-center px-3.5 text-[11px] uppercase tracking-[1.5px] text-faint">
              Reported
            </span>
          ) : (
            <Button variant="outline" onClick={onReport} className="text-danger">
              <Flag size={16} />
              Report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
