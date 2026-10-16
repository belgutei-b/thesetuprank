import type { ReactNode } from "react";
import { Link } from "react-router";

// TODO: make sure this inbox exists before deploying (e.g. Cloudflare Email Routing)
export const CONTACT_EMAIL = "contact@thesetuprank.com";
export const LAST_UPDATED = "9 October 2026";

type Props = {
  title: string;
  intro: ReactNode;
  seeAlso: { to: string; label: string };
  children: ReactNode;
};

export function LegalPage({ title, intro, seeAlso, children }: Props) {
  return (
    <article className="px-6 pb-8">
      <p className="text-[11px] uppercase tracking-[2.5px] text-muted">Legal</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight">
        {title}
      </h1>
      <p className="mt-2 text-xs uppercase tracking-widest text-faint">
        Last updated {LAST_UPDATED}
      </p>

      <div className="mt-6 text-[15px] leading-relaxed text-zinc-300">
        {intro}
      </div>

      <div className="mt-10 flex flex-col gap-9">{children}</div>

      <p className="mt-12 border-t border-line pt-6 text-sm leading-relaxed text-dim">
        Questions? Email{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-accent underline underline-offset-3"
        >
          {CONTACT_EMAIL}
        </a>
        . See also our{" "}
        <Link to={seeAlso.to} className="text-accent underline underline-offset-3">
          {seeAlso.label}
        </Link>
        .
      </p>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-zinc-300 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-3 [&_li]:mt-1.5 [&_strong]:font-medium [&_strong]:text-text [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
