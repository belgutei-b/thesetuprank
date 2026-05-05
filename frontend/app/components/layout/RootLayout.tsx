import { Outlet } from "react-router";
import { Logo } from "./Logo";
import { TabNav } from "./TabNav";
import { UtilityBar } from "./UtilityBar";

export function RootLayout() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <UtilityBar />
      <div className="max-w-3xl mx-auto">
        <Logo />
        <TabNav />
        <main className="py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
