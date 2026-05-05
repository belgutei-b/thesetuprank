import { useEffect, useState } from "react";
import { getRanking } from "~/api/setup";
import type { ApiSetupListItem } from "~/api/types";

const rankColor = (i: number) =>
  i === 0
    ? "text-gold"
    : i === 1
      ? "text-[#aaaaaa]"
      : i === 2
        ? "text-[#a0522d]"
        : "text-muted";

const statusClass =
  "text-center py-12 px-6 text-[11px] tracking-[2px] uppercase text-muted font-sans";

export default function Rankings() {
  const [setups, setSetups] = useState<ApiSetupListItem[]>([]);
  const [numberOfSetups, setNumberOfSetups] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRanking()
      .then((data) => {
        setSetups(data.setups);
        setNumberOfSetups(data.numberOfSetups);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className={statusClass}>Loading...</div>;
  }

  if (setups.length === 0) {
    return <div className={statusClass}>No rankings yet</div>;
  }

  return (
    <div className="py-8 px-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-zinc-300 text-[11px] tracking-[2.5px] uppercase font-sans m-0">
          This Week's Rankings
        </p>
        <p className="text-zinc-300 text-[11px] tracking-[2.5px] uppercase font-sans m-0">
          {numberOfSetups} Setups
        </p>
      </div>

      <div>
        {setups.map((setup, i) => (
          <div
            key={setup.id}
            className="flex items-center gap-4 py-3 border-b border-[#1c1c1c]"
          >
            <div
              className={`w-14 text-center font-serif italic text-[28px] ${rankColor(i)}`}
            >
              {i + 1}
            </div>

            <img
              src={setup.imageUrl}
              alt={setup.name}
              className="w-[120px] h-[120px] object-cover block"
            />

            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg font-medium text-[#e8e8e8] m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                {setup.name}
              </p>
              <p className="text-[11px] tracking-[1.5px] uppercase text-[#666] font-sans mt-1 mb-0">
                {setup.wins}W · {setup.losses}L
              </p>
            </div>

            <div className="text-right font-sans text-[#aaa]">
              <span className="text-zinc-300 text-xs">
                {Number(setup.rating).toLocaleString()}
              </span>{" "}
              <span className="text-zinc-300 text-xs uppercase">Elo</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
