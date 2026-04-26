import { useEffect, useState } from "react";

export function Welcome() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      const token = hash.slice("#token=".length);
      localStorage.setItem("token", token);
      window.history.replaceState(null, "", window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
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
              onClick={logout}
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
