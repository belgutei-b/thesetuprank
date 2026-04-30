import { useEffect, useState } from "react";

function getTimeRemaining() {
  const now = new Date();
  const next = new Date(now);
  const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
  next.setUTCDate(now.getUTCDate() + daysUntilMonday);
  next.setUTCHours(0, 0, 0, 0);

  const diff = next.getTime() - now.getTime();
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { d, h, m };
}

export function Logo() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-8">
      <h1
        className="text-8xl font-semibold leading-none tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Setup<em className="font-normal">Rank</em>
      </h1>
      <p
        className="text-xs uppercase tracking-widest mt-6 text-zinc-200"
        style={{
          letterSpacing: "0.15em",
        }}
      >
        thesetuprank.com
      </p>
      <p
        className="mt-3 uppercase text-zinc-300 font-light"
        style={{
          fontSize: "10px",
          letterSpacing: "0.25em",
        }}
      >
        rate the best battlestations
      </p>
      <p
        className="mt-3 uppercase text-zinc-300 font-light"
        style={{
          fontSize: "10px",
          letterSpacing: "0.25em",
        }}
      >
        week ends in {timeLeft.d}D {timeLeft.h}H {timeLeft.m}M
      </p>
    </div>
  );
}
