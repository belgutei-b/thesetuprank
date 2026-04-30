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
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "0 24px",
          marginTop: 16,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              aspectRatio: "1 / 1",
              background: "var(--color-surface)",
              borderRadius: 2,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: 13,
            letterSpacing: "1px",
            fontFamily: "var(--font-sans)",
            marginBottom: 16,
          }}
        >
          {error}
        </p>
        <button
          onClick={loadNext}
          style={{
            fontSize: 11,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#7EB8F7",
            background: "none",
            border: "1px solid #7EB8F7",
            padding: "6px 16px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!battle) return null;

  return <VotePair battle={battle} onNext={loadNext} />;
}
