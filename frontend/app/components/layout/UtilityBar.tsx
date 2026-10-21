import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "~/context/AuthContext";
import { Button } from "~/components/ui/button";

function getWeekOf() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return monday.toLocaleDateString("en-AU", { month: "short", day: "numeric" });
}

const menuItemClass =
  "flex h-12 w-full cursor-pointer items-center border-t border-line text-xs uppercase tracking-widest";

export function UtilityBar() {
  const { user, handleLogout, voteCount } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(closeMenu, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      {/* Tablet and desktop */}
      <div className="hidden items-center justify-between border-b border-line px-6 py-2 text-xs uppercase tracking-widest text-muted sm:flex">
        <span>EST. 2026 &nbsp;·&nbsp; WEEK OF {getWeekOf()}</span>

        <div className="flex items-center gap-4">
          {voteCount !== null && <span>{voteCount} votes</span>}
          {user ? (
            <>
              <Link
                to="/profile"
                className="transition-colors hover:text-text"
              >
                My Profile
              </Link>
              <Link
                to="/upload"
                className="transition-colors hover:text-text"
              >
                + Add Setup
              </Link>
              <button
                onClick={handleLogout}
                className="transition-colors hover:text-text cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="transition-colors hover:text-text"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="relative border-b border-line sm:hidden">
        <div className="flex h-13 items-center justify-between pl-4 pr-1">
          <Link
            to="/"
            className="font-serif text-[26px] font-semibold leading-none tracking-tight"
          >
            Setup<em className="font-normal">Rank</em>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="text-text"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Account"
            className="absolute inset-x-0 top-full z-40 border-b border-line bg-bg px-4 pb-2 shadow-[0_16px_32px_rgba(0,0,0,0.6)]"
          >
            {voteCount !== null && (
              <p className="py-3.5 text-xs uppercase tracking-widest text-faint">
                {voteCount} votes this week
              </p>
            )}
            {user ? (
              <>
                <Link to="/profile" onClick={closeMenu} className={menuItemClass}>
                  My Profile
                </Link>
                <Link to="/upload" onClick={closeMenu} className={menuItemClass}>
                  + Add Setup
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className={`${menuItemClass} text-faint`}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/sign-in" onClick={closeMenu} className={menuItemClass}>
                Sign In
              </Link>
            )}
            {/* Legal links: on tablet and desktop they're in the footer */}
            <div className="flex gap-6 border-t border-line">
              <Link
                to="/terms"
                onClick={closeMenu}
                className="flex h-12 items-center text-xs uppercase tracking-widest text-faint"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                onClick={closeMenu}
                className="flex h-12 items-center text-xs uppercase tracking-widest text-faint"
              >
                Privacy
              </Link>
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
