import { Link } from "react-router";
import { useAuth } from "~/context/AuthContext";

function getWeekOf() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return monday.toLocaleDateString("en-AU", { month: "short", day: "numeric" });
}

export function UtilityBar() {
  const { user, handleLogout, voteCount } = useAuth();

  return (
    <div
      className="flex items-center justify-between px-6 py-2 text-xs uppercase tracking-widest border-b border-[#222]"
      style={{ color: "var(--color-muted)" }}
    >
      <span>EST. 2026 &nbsp;·&nbsp; WEEK OF {getWeekOf()}</span>

      <div className="flex items-center gap-4">
        {voteCount !== null && (
          <span>{voteCount} votes</span>
        )}
        {user ? (
          <>
            <Link
              to="/profile"
              className="hover:text-[var(--color-text)] transition-colors"
            >
              My Profile
            </Link>
            <Link
              to="/submit"
              className="hover:text-[var(--color-text)] transition-colors"
            >
              + Add Setup
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            to="/sign-in"
            className="hover:text-[var(--color-text)] transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
