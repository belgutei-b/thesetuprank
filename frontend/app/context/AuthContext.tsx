import type { ApiUser } from "~/api/types";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, logout } from "~/api/auth";

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const fetchedUser = await getMe();
        if (isMounted) setUser(fetchedUser);
      } catch (err) {
        console.log("Unauthenticated user");
        if (isMounted) setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

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
