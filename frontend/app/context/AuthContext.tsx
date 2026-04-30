import type { ApiUser } from "~/api/types";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, logout } from "~/api/auth";
import { getVoteCount } from "~/api/vote";

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  handleLogout: () => Promise<void>;
  voteCount: number | null;
  incrementVoteCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: move the vote count from the AuthContext and put it in its own context
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voteCount, setVoteCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialData() {
      try {
        const fetchedUser = await getMe();
        if (isMounted) setUser(fetchedUser);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        setIsLoading(false);
      }

      try {
        const count = await getVoteCount();
        if (isMounted) setVoteCount(count);
      } catch {
        console.log("Failed to load the vote count");
        // non-critical, leave as null
      }
    }

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const incrementVoteCount = () => setVoteCount((prev) => (prev ?? 0) + 1);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.log("Failed to logout");
    }
  };

  const value = {
    user,
    isLoading,
    handleLogout,
    voteCount,
    incrementVoteCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
