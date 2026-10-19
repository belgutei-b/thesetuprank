import { Link } from "react-router";

const linkClass = "transition-colors hover:text-text";

// Tablet and desktop only: on phones these links are in the menu, since the
// vote page's fixed bottom bar would cover a footer
export function Footer() {
  return (
    <footer className="mt-auto hidden items-center justify-between border-t border-line px-6 py-4 text-xs uppercase tracking-widest text-muted sm:flex">
      <span>© {new Date().getFullYear()} SetupRank</span>
      <nav aria-label="Legal" className="flex items-center gap-4">
        <Link to="/terms" className={linkClass}>
          Terms
        </Link>
        <Link to="/privacy" className={linkClass}>
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
