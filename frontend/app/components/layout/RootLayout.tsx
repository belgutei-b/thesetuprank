import { Outlet, useMatches } from "react-router";
import { Footer } from "./Footer";
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

  // flex column so the footer sits at the bottom of short pages. `w-full` keeps
  // the centered columns full width (auto margins would shrink them to fit)
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <UtilityBar />
      <div className="mx-auto w-full max-w-3xl">
        <Logo />
        <TabNav />
      </div>
      {isFullWidth ? (
        <main className="w-full sm:py-8">
          <Outlet />
        </main>
      ) : (
        <main className="mx-auto w-full max-w-3xl py-8">
          <Outlet />
        </main>
      )}
      <Footer />
    </div>
  );
}
