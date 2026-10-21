import { useEffect, useState } from "react";

// The week resets every Monday at 00:00 UTC
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

export function useWeekCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}
