import { useEffect, useState } from "react";
import { getRanking } from "~/api/setup";
import type { ApiSetupListItem } from "~/api/types";
import SetupRow from "~/components/setup/SetupRow";

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
          Rankings
        </p>
        <p className="text-zinc-300 text-[11px] tracking-[2.5px] uppercase font-sans m-0">
          {numberOfSetups} Setups
        </p>
      </div>

      <div>
        {setups.map((setup, i) => (
          <SetupRow key={setup.id} setup={setup} rank={i} />
        ))}
      </div>
    </div>
  );
}
