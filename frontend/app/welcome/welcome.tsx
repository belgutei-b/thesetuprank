import { useAuth } from "~/context/AuthContext";

export function Welcome() {
  const { user, isLoading, handleLogout } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Coming soon - voting section</div>;
}
