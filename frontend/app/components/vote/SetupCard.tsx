import type { ApiSetupBrief } from "~/api/types";

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

  return (
    <div className="flex flex-col gap-[6px] flex-1 min-w-0">
      {/* ID + name */}
      <div style={{ marginTop: 10, marginBottom: 8 }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: "1.5px",
            color: "var(--color-muted)",
            textTransform: "uppercase",
            marginBottom: 3,
            fontFamily: "var(--font-sans)",
          }}
        >
          #{" "}
          {setup.id.slice(0, 5).toUpperCase()}
        </p>
        <p
          style={{
            fontSize: 22,
            fontFamily: "var(--font-serif)",
            fontWeight: 700,
            color: "var(--color-text)",
            lineHeight: 1.2,
          }}
        >
          {setup.description}
        </p>
      </div>

      {/* Image */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: "1 / 1",
          borderRadius: 2,
          overflow: "hidden",
          opacity: isLoser ? 0.45 : 1,
          transition: "opacity 0.4s ease",
          cursor: isIdle ? "pointer" : "default",
        }}
        onClick={isIdle ? onVote : undefined}
      >
        <img
          src={setup.imageUrl}
          alt={setup.description}
          className="w-full h-full object-cover"
        />

        {/* YOUR PICK badge — shown on winner */}
        {isWinner && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              border: "1.5px solid #7EB8F7",
              color: "#7EB8F7",
              background: "rgba(13,13,13,0.8)",
              fontSize: 10,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "2px 10px",
              fontFamily: "var(--font-sans)",
            }}
          >
            Your Pick
          </div>
        )}

        {/* Rating diff — shown after vote resolves */}
        {!isIdle && ratingDiff !== undefined && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.65)",
              padding: "8px 12px",
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: isWinner ? "#7EB8F7" : "#666",
                fontFamily: "var(--font-sans)",
                letterSpacing: "1px",
              }}
            >
              {isWinner ? "+" : ""}
              {ratingDiff} pts
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 4,
        }}
      >
        <button
          style={{
            fontSize: 10,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#7EB8F7",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            padding: 0,
          }}
        >
          ↳ Save
        </button>
        <button
          style={{
            fontSize: 10,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            padding: 0,
          }}
        >
          ⚑ Report
        </button>
      </div>
    </div>
  );
}
