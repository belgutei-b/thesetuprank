import { useEffect, useState } from "react";
import { getMe, logout } from "~/api/auth";

export function Welcome() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    async function tmpFunction() {
      try {
        const res = await getMe();
        setUser(res);
      } catch (err) {
        console.log("Failed to authenticate user");
      }
    }
    tmpFunction();
  }, []);

  async function handleLogout() {
    // todo call logout library function
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.log("Failed to logout");
    }
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <h1 className="text-3xl font-bold">Rate Setup</h1>

        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-700 dark:text-gray-200">
              Signed in as <strong>{user.name}</strong> ({user.email}) (
              {user.id})
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              window.location.href = "/api/auth/login";
            }}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Login with Google
          </button>
        )}
      </div>
    </main>
  );
}
