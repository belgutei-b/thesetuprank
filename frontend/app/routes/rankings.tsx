import { useEffect, useState } from "react";
import { getRanking } from "~/api/setup";
import type { ApiSetupListItem } from "~/api/types";
import SetupRow from "~/components/setup/SetupRow";

// The list sets its own width so it can grow on big monitors
export const handle = { fullWidth: true };

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
    // 768px like the other pages, wider from 1536px and 1920px screens.
    // The full width <main> has no top padding on phones, hence py-16 there
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-8 2xl:max-w-5xl min-[120rem]:max-w-6xl">
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
