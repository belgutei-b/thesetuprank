import { Outlet, useMatches } from "react-router";
import { Logo } from "./Logo";
import { TabNav } from "./TabNav";
import { UtilityBar } from "./UtilityBar";

// A route can export `handle = { fullWidth: true }` to lay out its own width
// instead of the default 768px column
type RouteHandle = { fullWidth?: boolean };

export function RootLayout() {
  const isFullWidth = useMatches().some(
    (match) => (match.handle as RouteHandle | undefined)?.fullWidth,
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <UtilityBar />
      <div className="max-w-3xl mx-auto">
        <Logo />
        <TabNav />
      </div>
      {isFullWidth ? (
        <main className="sm:py-8">
          <Outlet />
        </main>
      ) : (
        <main className="max-w-3xl mx-auto py-8">
          <Outlet />
        </main>
      )}
    </div>
  );
}
