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
  imageUrl: string;
  description: string;
  rating: number;
  createdAt: string;
  featuredAt?: string;
};

export type Setup = Omit<ApiSetup, "createdAt" | "featuredAt"> & {
  createdAt: Date;
  featuredAt?: Date;
};
