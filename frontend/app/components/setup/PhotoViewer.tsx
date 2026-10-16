import type { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useSwipe } from "~/hooks/useSwipe";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
};

// The photo with its name and description, styled like the profile page's
// modal. No wins, losses or rating, so they don't sway how people vote.
// It shares its index with the PhotoStage, so it opens on the photo that was
// showing, and closing it leaves the stage on the photo you ended on
export default function PhotoViewer({
  open,
  onOpenChange,
  name,
  description,
  photos,
  index,
  onIndexChange,
}: Props) {
  const count = photos.length;
  const hasMany = count > 1;

  function go(step: number) {
    if (!hasMany) return;
    onIndexChange((index + step + count) % count);
  }

  const swipe = useSwipe(go);

  // ← / → browse (Escape is handled by the dialog)
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Phone and tablet: photo on top. Desktop: photo | details */}
      <DialogContent
        showCloseButton={false}
        onKeyDown={handleKeyDown}
        className="flex max-h-[calc(100dvh-32px)] w-[calc(100%-2rem)] max-w-[460px] flex-col gap-0 overflow-y-auto rounded-none border border-line bg-surface p-0 text-text ring-0 sm:max-w-[460px] md:max-w-[740px] md:flex-row"
      >
        {/* Phone and tablet: on top of the photo. Desktop: plain, over the
            details */}
        <DialogClose
          aria-label="Close"
          render={
            <Button
              variant="overlay"
              size="icon"
              className="absolute right-2 top-2 z-10 md:right-1 md:top-1 md:bg-transparent md:text-[#555] md:hover:bg-transparent md:hover:text-[#999]"
            />
          }
        >
          <X size={16} />
        </DialogClose>

        <div
          {...swipe}
          className="relative aspect-square w-full shrink-0 bg-bg md:w-[460px]"
        >
          <img
            src={photos[index]}
            alt={`${name}, photo ${index + 1} of ${count}`}
            draggable={false}
            className="h-full w-full object-contain"
          />

          {hasMany && (
            <>
              <Button
                variant="overlay"
                size="icon"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                variant="overlay"
                size="icon"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <ChevronRight size={20} />
              </Button>
              <span className="pointer-events-none absolute bottom-2.5 right-2.5 bg-black/75 px-2 py-0.5 text-xs tabular-nums text-text">
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2.5 p-5 md:pr-12">
          <DialogTitle className="text-[20px] font-semibold leading-tight">
            {name}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-zinc-300">
            {description}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}
