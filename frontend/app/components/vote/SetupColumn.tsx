import { useState } from "react";
import type { ApiSetupBrief } from "~/api/types";
import { useSaveSetup } from "~/hooks/useSaveSetup";
import PhotoStage from "~/components/setup/PhotoStage";
import PhotoViewer from "~/components/setup/PhotoViewer";
import ReportDialog from "~/components/setup/ReportDialog";
import SetupDetailsDialog from "~/components/setup/SetupDetailsDialog";
import Description from "./Description";
import SetupHeader from "./SetupHeader";
import ThumbStrip from "./ThumbStrip";

export type Side = "A" | "B";
export type CardState = "idle" | "winner" | "loser";

type Props = {
  side: Side;
  setup: ApiSetupBrief;
  photos: string[];
  state: CardState;
  ratingDiff?: string;
  initialSaved: boolean;
  onPick: () => void;
  onSkip: () => void;
};

// Literal class names so Tailwind picks them up
const COLUMN = { A: "sm:col-start-1", B: "sm:col-start-3" } as const;

const badgeClass =
  "block bg-bg/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[2px] tabular-nums";

// Renders one side of the battle as separate grid cells (header, photo,
// thumbnails, description). VotePair's grid lines the cells up in rows, so
// both sides stay level even when one description is longer.
// Clicking the photo picks the setup
export default function SetupColumn({
  side,
  setup,
  photos,
  state,
  ratingDiff,
  initialSaved,
  onPick,
  onSkip,
}: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const { isSaved, isSaving, toggleSave } = useSaveSetup(
    setup.id,
    initialSaved,
  );

  const column = COLUMN[side];

  function openReport() {
    setIsDetailsOpen(false);
    setIsReportOpen(true);
  }

  // The vote result sits on the photo once a side is picked
  let badge = null;
  if (state === "winner") {
    badge = (
      <span className={`${badgeClass} border-[1.5px] border-accent text-accent`}>
        Your pick{ratingDiff && ` · ${ratingDiff}`}
      </span>
    );
  } else if (state === "loser" && ratingDiff) {
    badge = (
      <span className={`${badgeClass} border border-line-strong text-faint`}>
        {ratingDiff}
      </span>
    );
  }

  return (
    <>
      <SetupHeader
        className={`${column} sm:row-start-1`}
        name={setup.name}
        isSaved={isSaved}
        isSaving={isSaving}
        onToggleSave={toggleSave}
        isReported={isReported}
        onReport={openReport}
        onOpenDetails={() => setIsDetailsOpen(true)}
        onViewFullSize={() => setIsViewerOpen(true)}
      />

      <PhotoStage
        className={`${column} sm:row-start-2`}
        name={setup.name}
        photos={photos}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
        onExpand={() => setIsViewerOpen(true)}
        onSelect={state === "idle" ? onPick : undefined}
        selectLabel={`Pick ${setup.name}`}
        isDimmed={state === "loser"}
        badge={badge}
      />

      <ThumbStrip
        className={`hidden! sm:flex! ${column} sm:row-start-3`}
        name={setup.name}
        photos={photos}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
      />

      <Description
        className={`hidden sm:block ${column} sm:row-start-4`}
        text={setup.description}
      />

      <PhotoViewer
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        name={setup.name}
        description={setup.description}
        photos={photos}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
      />

      <SetupDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        name={setup.name}
        description={setup.description}
        photos={photos}
        isSaved={isSaved}
        isSaving={isSaving}
        onToggleSave={toggleSave}
        isReported={isReported}
        onReport={openReport}
      />

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        setupId={setup.id}
        name={setup.name}
        onReported={() => setIsReported(true)}
        onSkip={onSkip}
      />
    </>
  );
}
