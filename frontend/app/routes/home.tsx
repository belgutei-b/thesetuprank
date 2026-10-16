import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import type { ApiVoteGet } from "~/api/types";
import { getVote } from "~/api/vote";
import { Button } from "~/components/ui/button";
import VotePair from "~/components/vote/VotePair";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SetupRank" },
    { name: "description", content: "Welcome to Setup Rank!" },
  ];
}

// The battle sets its own width (wider than the default column)
export const handle = { fullWidth: true };

export default function Home() {
  const [battle, setBattle] = useState<ApiVoteGet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFetching = useRef(false);

  // The current battle stays on screen until the next one arrives, so moving
  // on after a vote doesn't flash the loading skeleton
  async function loadNext() {
    // ignore repeat skips (and the auto-advance) while one is on its way
    if (isFetching.current) return;
    isFetching.current = true;
    setError(null);
    try {
      const data = await getVote();
      setBattle(data);
    } catch {
      setError("Failed to load setups. Please try again.");
    } finally {
      isFetching.current = false;
    }
  }

  useEffect(() => {
    loadNext();
  }, []);

  if (error) {
    return (
      <div className="text-center py-10 px-6">
        <p className="text-muted text-[13px] tracking-[1px] font-sans mb-4">
          {error}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadNext}
          className="border-accent text-accent"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // first load
  if (!battle) {
    return (
      <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-y-[76px] px-4 pt-[62px] sm:grid-cols-2 sm:gap-x-20 sm:px-6 sm:pt-[99px]">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="aspect-[16/10] animate-pulse rounded-xs bg-surface sm:aspect-[4/3]"
          />
        ))}
      </div>
    );
  }

  return <VotePair key={battle.battleId} battle={battle} onNext={loadNext} />;
}
