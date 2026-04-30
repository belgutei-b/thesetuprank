import type { ApiVoteGet, ApiVoteResponse } from "~/api/types";

export async function getVoteCount(): Promise<number> {
  const res = await fetch("/api/vote/count", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch vote count");
  const data = await res.json();
  return data.count;
}

export async function getVote(): Promise<ApiVoteGet> {
  const res = await fetch("/api/vote", {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get battle");
  return res.json();
}

export async function postVote(
  battleId: string,
  winnerSetupId: string,
  loserSetupId: string,
): Promise<ApiVoteResponse> {
  const res = await fetch("/api/vote", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      battleId,
      winnerId: winnerSetupId,
      loserId: loserSetupId,
    }),
  });
  if (!res.ok) throw new Error("Failed to submit vote");
  return res.json();
}
