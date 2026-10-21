import { NavLink } from "react-router";

const tabs = [
  { label: "VOTE", to: "/" },
  { label: "RANKINGS", to: "/rankings" },
];

export function TabNav() {
  return (
    <nav className="flex items-end gap-6 border-b border-line px-4 pt-3 sm:gap-8 sm:px-6 sm:pt-0">
      {tabs.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            [
              "pb-2 text-xs tracking-widest uppercase transition-colors",
              isActive
                ? "text-[var(--color-text)] border-b-2 border-[var(--color-text)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]",
            ].join(" ")
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
