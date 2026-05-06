import { useState } from "react";
import type { ApiSetupBrief } from "~/api/types";
import { reportSetup } from "~/api/setup";

type CardState = "idle" | "winner" | "loser";

type Props = {
  setup: ApiSetupBrief;
  state: CardState;
  ratingDiff?: number;
  onVote: () => void;
};

export default function SetupCard({ setup, state, ratingDiff, onVote }: Props) {
  const isIdle = state === "idle";
  const isWinner = state === "winner";
  const isLoser = state === "loser";

  const [reportStatus, setReportStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleReport() {
    if (reportStatus !== "idle") return;
    setReportStatus("loading");
    try {
      await reportSetup(setup.id);
      setReportStatus("done");
    } catch {
      setReportStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-[6px] flex-1 min-w-0">
      {/* Image */}
      <div
        className={`relative w-full aspect-square rounded-xs overflow-hidden transition-opacity duration-400 ${
          isLoser ? "opacity-45" : "opacity-100"
        } ${isIdle ? "cursor-pointer" : "cursor-default"}`}
        onClick={isIdle ? onVote : undefined}
      >
        <img
          src={setup.imageUrl}
          alt={setup.description}
          className="w-full h-full object-cover"
        />

        {/* YOUR PICK badge — shown on winner */}
        {isWinner && (
          <div className="absolute top-[10px] left-[10px] border-[1.5px] border-accent text-accent bg-bg/80 text-[10px] tracking-[2px] uppercase px-[10px] py-[2px] font-sans">
            Your Pick
          </div>
        )}

        {/* Rating diff — shown after vote resolves */}
        {!isIdle && ratingDiff !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-3 py-2">
            <p
              className={`text-[15px] font-bold font-sans tracking-[1px] ${
                isWinner ? "text-accent" : "text-[#666]"
              }`}
            >
              {isWinner ? "+" : ""}
              {ratingDiff} pts
            </p>
          </div>
        )}
      </div>

      {/* ID + name (below image) */}
      <div className="mt-[10px] mb-2">
        <p className="text-[11px] tracking-[1.5px] text-muted uppercase mb-[3px] font-sans">
          # {setup.id.slice(0, 5).toUpperCase()}
        </p>
        <p className="text-[22px] font-serif font-bold text-text leading-[1.2]">
          {setup.name}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-[14px] mt-1">
        <button className="text-[10px] tracking-[1.5px] uppercase text-accent bg-transparent border-0 cursor-pointer font-sans p-0">
          ↳ Save
        </button>
        <button
          onClick={handleReport}
          disabled={reportStatus !== "idle"}
          className="text-[10px] tracking-[1.5px] uppercase bg-transparent border-0 font-sans p-0 disabled:cursor-default cursor-pointer text-muted disabled:opacity-50"
        >
          {reportStatus === "loading" && "⚑ Reporting..."}
          {reportStatus === "done" && "⚑ Reported"}
          {reportStatus === "error" && "⚑ Failed"}
          {reportStatus === "idle" && "⚑ Report"}
        </button>
      </div>
    </div>
  );
}
