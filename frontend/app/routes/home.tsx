import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import type { ApiVoteGet } from "~/api/types";
import { getVote } from "~/api/vote";
import VotePair from "~/components/vote/VotePair";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SetupRank" },
    { name: "description", content: "Welcome to Setup Rank!" },
  ];
}

export default function Home() {
  const [battle, setBattle] = useState<ApiVoteGet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNext() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVote();
      setBattle(data);
    } catch {
      setError("Failed to load setups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNext();
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-4 px-6 mt-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex-1 aspect-square bg-surface rounded-xs animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-6">
        <p className="text-muted text-[13px] tracking-[1px] font-sans mb-4">
          {error}
        </p>
        <button
          onClick={loadNext}
          className="text-[11px] tracking-[2px] uppercase text-accent bg-transparent border border-accent px-4 py-1.5 cursor-pointer font-sans"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!battle) return null;

  return <VotePair battle={battle} onNext={loadNext} />;
}
