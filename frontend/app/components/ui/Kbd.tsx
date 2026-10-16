import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Kbd({ children, className = "" }: Props) {
  return (
    <kbd
      className={`inline-grid h-[22px] min-w-[22px] place-items-center rounded-xs border border-line-strong bg-bg px-1.5 font-sans text-xs tracking-normal text-dim ${className}`}
    >
      {children}
    </kbd>
  );
}
