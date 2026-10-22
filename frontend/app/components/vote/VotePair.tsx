import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { ApiVoteGet, ApiVoteResponse } from "~/api/types";
import { postVote } from "~/api/vote";
import { useAuth } from "~/context/AuthContext";
import { Button } from "~/components/ui/button";
import Kbd from "~/components/ui/Kbd";
import SetupColumn, { type CardState, type Side } from "./SetupColumn";

type Props = {
  battle: ApiVoteGet;
  onNext: () => void;
};

// How long the vote result stays on screen before the next pairing loads
const AUTO_ADVANCE_MS = 1000;

// Width of the battle (also used by the loading skeleton in home.tsx). Grows
// with the screen so the photos fill big monitors, but only as far as the
// photos still fit above the fold: everything above them takes ~440px, and
// each 4:3 photo is (width - 128px) / 2 wide. Never narrower than 1040px, the
// size on a 13" laptop
export const BATTLE_WIDTH =
  "max-w-[clamp(1040px,calc((100dvh-440px)*8/3+128px),1840px)]";

function formatDiff(diff: number) {
  return `${diff > 0 ? "+" : ""}${diff} pts`;
}

// Render with key={battle.battleId} so every new battle starts from a clean state
export default function VotePair({ battle, onNext }: Props) {
  const { incrementVoteCount } = useAuth();
  const [winner, setWinner] = useState<Side | null>(null);
  const [voteResponse, setVoteResponse] = useState<ApiVoteResponse | null>(
    null,
  );

  const hasVoted = winner !== null;

  async function handleVote(picked: Side) {
    if (winner) return;

    const winnerSetup = picked === "A" ? battle.setupA : battle.setupB;
    const loserSetup = picked === "A" ? battle.setupB : battle.setupA;

    setWinner(picked);

    try {
      const res = await postVote(
        battle.battleId,
        winnerSetup.id,
        loserSetup.id,
      );
      setVoteResponse(res);
      incrementVoteCount();
    } catch {
      setWinner(null);
      toast.error("Failed to submit your vote. Please try again.");
    }
  }

  // Moves on by itself once the vote is in. If a dialog (full size view,
  // report) is open by then, it stays put so nothing vanishes from under the
  // user. Next still works
  useEffect(() => {
    if (!voteResponse) return;
    const timer = setTimeout(() => {
      if (document.querySelector("[role='dialog']")) return;
      onNext();
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [voteResponse]);

  // ← / → pick a side, S skips (or moves on after voting)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      // open menus and dialogs use the arrow keys themselves
      if (document.querySelector("[role='dialog'], [role='menu']")) return;

      if (e.key === "ArrowLeft") handleVote("A");
      else if (e.key === "ArrowRight") handleVote("B");
      else if (e.key === "s" || e.key === "S") onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function stateOf(side: Side): CardState {
    if (winner === null) return "idle";
    return winner === side ? "winner" : "loser";
  }

  function diffOf(side: Side) {
    if (!voteResponse) return undefined;
    return formatDiff(
      winner === side ? voteResponse.winnerDiff : voteResponse.loserDiff,
    );
  }

  const pickedName =
    winner === "A" ? battle.setupA.name : winner === "B" ? battle.setupB.name : "";

  return (
    <div>
      <p className="mb-7 hidden px-6 text-center text-[11px] uppercase tracking-[2.5px] text-muted sm:block">
        — {hasVoted ? `You picked ${pickedName}` : "Pick the superior setup"} —
      </p>

      {/* One column on phones. From sm up: A | vs | B, with rows for header,
          photo, thumbnails and description */}
      <div className={`mx-auto grid ${BATTLE_WIDTH} grid-cols-1 gap-y-1.5 px-4 pt-3 pb-28 sm:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] sm:gap-x-5 sm:gap-y-3 sm:px-6 sm:pt-0 sm:pb-0`}>
        <SetupColumn
          side="A"
          setup={battle.setupA}
          photos={battle.setupA.imageKeys}
          state={stateOf("A")}
          ratingDiff={diffOf("A")}
          initialSaved={battle.isSavedSetupA}
          onPick={() => handleVote("A")}
          onSkip={onNext}
        />

        <div aria-hidden="true" className="flex h-[26px] items-center gap-3 sm:hidden">
          <span className="h-px flex-1 bg-line" />
          <span className="font-serif text-sm italic text-dim">vs</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div
          aria-hidden="true"
          className="hidden w-px justify-self-center bg-line sm:col-start-2 sm:row-span-4 sm:row-start-1 sm:block"
        />
        <span
          aria-hidden="true"
          className="hidden size-10 place-items-center self-center justify-self-center rounded-full border border-line-strong bg-bg font-serif text-[15px] italic text-dim sm:col-start-2 sm:row-start-2 sm:grid"
        >
          vs
        </span>

        <SetupColumn
          side="B"
          setup={battle.setupB}
          photos={battle.setupB.imageKeys}
          state={stateOf("B")}
          ratingDiff={diffOf("B")}
          initialSaved={battle.isSavedSetupB}
          onPick={() => handleVote("B")}
          onSkip={onNext}
        />
      </div>

      {/* Tablet and desktop */}
      <div className="mt-6 hidden text-center sm:block">
        <Button
          variant="link"
          onClick={onNext}
          className={hasVoted ? "text-accent" : undefined}
        >
          {hasVoted ? "Next pairing →" : "Skip pairing"}
        </Button>
        <p className="mt-1.5 hidden items-center justify-center gap-x-4.5 text-xs text-muted lg:flex">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            pick
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>S</Kbd>
            {hasVoted ? "next" : "skip"}
          </span>
        </p>
      </div>

      {/* Phone: always within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:hidden">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-[13px] text-dim">
            {hasVoted ? (
              <>
                You picked <span className="text-text">{pickedName}</span>
                {voteResponse && (
                  <span className="tabular-nums text-accent">
                    {" "}
                    · {formatDiff(voteResponse.winnerDiff)}
                  </span>
                )}
              </>
            ) : (
              "Tap the better setup"
            )}
          </p>
          {hasVoted ? (
            <Button size="lg" onClick={onNext}>
              Next →
            </Button>
          ) : (
            <Button variant="link" size="lg" onClick={onNext}>
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
