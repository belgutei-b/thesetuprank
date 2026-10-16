import { useState } from "react";
import type { ApiSetupListItem } from "~/api/types";
import { photosOf } from "~/lib/photos";
import PhotoStage from "./PhotoStage";
import PhotoViewer from "./PhotoViewer";

type Props = {
  setup: ApiSetupListItem;
  // 0-based place on the rankings page. Leave it out for lists without one
  // (my setups, saved setups)
  rank?: number;
};

const rankColor = (i: number) =>
  i === 0
    ? "text-gold"
    : i === 1
      ? "text-[#aaaaaa]"
      : i === 2
        ? "text-[#a0522d]"
        : "text-muted";

// One setup in a list (rankings, profile): the same photo stage and full
// size viewer as the vote page, just smaller. Clicking the photo opens it
// full size
export default function SetupRow({ setup, rank }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const photos = photosOf(setup.imageUrl);
  const rating = Number(setup.rating).toLocaleString();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#1c1c1c] sm:gap-4">
      {rank !== undefined && (
        <div
          className={`w-8 shrink-0 text-center font-serif italic text-2xl sm:w-14 sm:text-[28px] ${rankColor(rank)}`}
        >
          {rank + 1}
        </div>
      )}

      <PhotoStage
        size="small"
        className="w-32 shrink-0 sm:w-48"
        name={setup.name}
        photos={photos}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
        onExpand={() => setIsViewerOpen(true)}
        onSelect={() => setIsViewerOpen(true)}
        selectLabel={`View ${setup.name} full size`}
      />

      <div className="flex-1 min-w-0">
        <p className="font-serif text-lg font-medium text-[#e8e8e8] m-0 whitespace-nowrap overflow-hidden text-ellipsis">
          {setup.name}
        </p>
        <p className="text-[11px] tracking-[1.5px] uppercase text-[#666] font-sans mt-1 mb-0">
          {setup.wins}W · {setup.losses}L
          {/* Phone: no room for the Elo column */}
          <span className="sm:hidden"> · {rating} Elo</span>
        </p>
      </div>

      <div className="hidden text-right font-sans text-[#aaa] sm:block">
        <span className="text-zinc-300 text-xs">{rating}</span>{" "}
        <span className="text-zinc-300 text-xs uppercase">Elo</span>
      </div>

      <PhotoViewer
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        name={setup.name}
        description={setup.description}
        photos={photos}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
      />
    </div>
  );
}
