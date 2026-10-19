export type ApiUser = {
  id: string;
  name: string;
  email: string;
  handle: string;
  imageUrl: string;
  // receives string for Date objects
  createdAt: string;
};

// string -> Date object
export type User = Omit<ApiUser, "createdAt"> & {
  createdAt: Date;
};

export type ApiSetup = {
  id: string;
  name: string;
  // full image URLs (1 to 4), in display order: the first one is the cover
  imageKeys: string[];
  description: string;
  rating: number;
  createdAt: string;
  featuredAt?: string;
};

export type Setup = Omit<ApiSetup, "createdAt" | "featuredAt"> & {
  createdAt: Date;
  featuredAt?: Date;
};

export type ApiSetupBrief = Omit<ApiSetup, "createdAt" | "featuredAt">;

export type ApiSetupListItem = {
  id: string;
  // full image URLs (1 to 4), in display order: the first one is the cover
  imageKeys: string[];
  name: string;
  description: string;
  rating: number;
  wins: number;
  losses: number;
  createdAt: string;
  featuredAt?: string;
};

export type ApiVoteGet = {
  battleId: string;
  setupA: ApiSetupBrief;
  setupB: ApiSetupBrief;
  isSavedSetupA: boolean;
  isSavedSetupB: boolean;
};

export type ApiVoteResponse = {
  battleId: string;
  winnerDiff: number;
  loserDiff: number;
};
