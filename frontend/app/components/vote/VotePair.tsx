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
  const [voteResponse, setVoteResponse] = useState<ApiVoteResponse | null>(
    null,
  );

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
      const res = await postVote(
        battle.battleId,
        winnerSetup.id,
        loserSetup.id,
      );
      setVoteResponse(res);
      incrementVoteCount();
      setTimeout(onNext, 1500);
    } catch {
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

  const voted = voteState === "voted";

  return (
    <div>
      {/* Instruction text */}
      <p className="text-center text-[11px] tracking-[2.5px] uppercase font-sans mb-8 transition-colors duration-300 text-muted">
        — Tap the superior setup —
      </p>

      {/* Photo pair */}
      <div className="flex gap-4 px-6">
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
          initialSaved={battle.isSavedSetupA}
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
          initialSaved={battle.isSavedSetupB}
        />
      </div>

      {/* Skip / Next */}
      <div className="text-center mt-4 mb-5">
        <button
          onClick={handleSkip}
          className={`text-[11px] tracking-[2px] uppercase bg-transparent border-0 cursor-pointer underline underline-offset-[3px] font-sans transition-colors duration-300 ${
            voted ? "text-accent" : "text-muted"
          }`}
        >
          {voted ? "Next Pairing →" : "Skip Pairing"}
        </button>
      </div>
    </div>
  );
}
