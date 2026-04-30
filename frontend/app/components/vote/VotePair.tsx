import { useEffect, useState } from "react";
import type { ApiVoteGet, ApiVoteResponse } from "~/api/types";
import { postVote } from "~/api/vote";
import { useAuth } from "~/context/AuthContext";
import SetupCard from "./SetupCard";

type VoteState = "idle" | "voted";
type Winner = "A" | "B" | null;

type Props = {
  battle: ApiVoteGet;
  onNext: () => void;
};

export default function VotePair({ battle, onNext }: Props) {
  const { incrementVoteCount } = useAuth();
  const [voteState, setVoteState] = useState<VoteState>("idle");
  const [winner, setWinner] = useState<Winner>(null);
  const [voteResponse, setVoteResponse] = useState<ApiVoteResponse | null>(null);

  // Reset state when a new battle is loaded
  useEffect(() => {
    setVoteState("idle");
    setWinner(null);
    setVoteResponse(null);
  }, [battle.battleId]);

  async function handleVote(picked: "A" | "B") {
    if (voteState !== "idle") return;

    const winnerSetup = picked === "A" ? battle.setupA : battle.setupB;
    const loserSetup = picked === "A" ? battle.setupB : battle.setupA;

    setWinner(picked);
    setVoteState("voted");

    try {
      const res = await postVote(battle.battleId, winnerSetup.id, loserSetup.id);
      setVoteResponse(res);
      incrementVoteCount();
      setTimeout(onNext, 1500);
    } catch {
      // Still advance even if the request failed
      setTimeout(onNext, 1500);
    }
  }

  function handleSkip() {
    onNext();
  }

  const stateA =
    voteState === "idle" ? "idle" : winner === "A" ? "winner" : "loser";
  const stateB =
    voteState === "idle" ? "idle" : winner === "B" ? "winner" : "loser";

  const winnerName =
    winner === "A" ? battle.setupA.description : battle.setupB.description;

  return (
    <div>
      {/* Instruction text */}
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: voteState === "voted" ? "#7EB8F7" : "var(--color-muted)",
          fontFamily: "var(--font-sans)",
          marginBottom: 4,
          transition: "color 0.3s ease",
        }}
      >
        {voteState === "idle"
          ? "— Tap the superior setup —"
          : `— You voted for ${winnerName} —`}
      </p>

      {/* Photo pair */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "0 24px",
        }}
      >
        <SetupCard
          setup={battle.setupA}
          state={stateA}
          ratingDiff={
            voteResponse
              ? stateA === "winner"
                ? voteResponse.winnerDiff
                : voteResponse.loserDiff
              : undefined
          }
          onVote={() => handleVote("A")}
        />
        <SetupCard
          setup={battle.setupB}
          state={stateB}
          ratingDiff={
            voteResponse
              ? stateB === "winner"
                ? voteResponse.winnerDiff
                : voteResponse.loserDiff
              : undefined
          }
          onVote={() => handleVote("B")}
        />
      </div>

      {/* Skip / Next */}
      <div style={{ textAlign: "center", marginTop: 16, marginBottom: 20 }}>
        <button
          onClick={handleSkip}
          style={{
            fontSize: 11,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: voteState === "voted" ? "#7EB8F7" : "var(--color-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            fontFamily: "var(--font-sans)",
            transition: "color 0.3s ease",
          }}
        >
          {voteState === "voted" ? "Next Pairing →" : "Skip Pairing"}
        </button>
      </div>
    </div>
  );
}
