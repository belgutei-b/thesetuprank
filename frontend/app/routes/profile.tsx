import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getSetups } from "~/api/setup";
import { getSavedSetups } from "~/api/saved";
import type { ApiSetupListItem } from "~/api/types";
import SetupRow from "~/components/setup/SetupRow";

export default function Profile() {
  const [setups, setSetups] = useState<ApiSetupListItem[]>([]);
  const [savedSetups, setSavedSetups] = useState<ApiSetupListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSetups()
      .then(setSetups)
      .catch(console.error)
      .finally(() => setIsLoading(false));

    getSavedSetups()
      .then(setSavedSetups)
      .catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12 px-6 text-[11px] tracking-[2px] uppercase text-muted font-sans">
        Loading...
      </div>
    );
  }

  // Same rows as the rankings page, without the rank number
  return (
    <div className="px-6 py-8 flex flex-col gap-10">
      {/* My Setups */}
      <section>
        <p className="text-[11px] tracking-[2.5px] uppercase text-muted font-sans mb-4">
          My Setups
        </p>
        <div>
          {setups.map((setup) => (
            <SetupRow key={setup.id} setup={setup} />
          ))}
        </div>
        <Link
          to="/upload"
          className="mt-3 flex h-14 items-center justify-center gap-2 border border-dashed border-[#333] text-[#555] no-underline transition-colors hover:text-text"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-[11px] tracking-[2px] uppercase font-sans">
            Add Setup
          </span>
        </Link>
      </section>

      {/* Saved Setups */}
      {savedSetups.length > 0 && (
        <section>
          <p className="text-[11px] tracking-[2.5px] uppercase text-muted font-sans mb-4">
            Saved Setups
          </p>
          <div>
            {savedSetups.map((setup) => (
              <SetupRow key={setup.id} setup={setup} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
