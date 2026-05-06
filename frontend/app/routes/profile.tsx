import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Expand } from "lucide-react";
import { getSetups } from "~/api/setup";
import { getSavedSetups } from "~/api/saved";
import type { ApiSetupListItem } from "~/api/types";
import SetupDetailModal from "~/components/setup/SetupDetailModal";

export default function Profile() {
  const [setups, setSetups] = useState<ApiSetupListItem[]>([]);
  const [savedSetups, setSavedSetups] = useState<ApiSetupListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSetup, setSelectedSetup] = useState<ApiSetupListItem | null>(null);

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

  return (
    <>
      <div className="px-6 py-8 flex flex-col gap-10">
        {/* My Setups */}
        <section>
          <p className="text-[11px] tracking-[2.5px] uppercase text-muted font-sans mb-4">
            My Setups
          </p>
          <div className="grid grid-cols-4 gap-4">
            {setups.map((setup) => (
              <SetupCard key={setup.id} setup={setup} onOpen={setSelectedSetup} />
            ))}
            <Link
              to="/submit"
              className="bg-[#161616] border border-dashed border-[#333] aspect-square flex flex-col items-center justify-center gap-2 no-underline text-[#555]"
            >
              <span className="text-[28px] leading-none">+</span>
              <span className="text-[11px] tracking-[2px] uppercase font-sans">
                Add Setup
              </span>
            </Link>
          </div>
        </section>

        {/* Saved Setups */}
        {savedSetups.length > 0 && (
          <section>
            <p className="text-[11px] tracking-[2.5px] uppercase text-muted font-sans mb-4">
              Saved Setups
            </p>
            <div className="grid grid-cols-4 gap-4">
              {savedSetups.map((setup) => (
                <SetupCard key={setup.id} setup={setup} onOpen={setSelectedSetup} />
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedSetup && (
        <SetupDetailModal
          setup={selectedSetup}
          onClose={() => setSelectedSetup(null)}
        />
      )}
    </>
  );
}

function SetupCard({
  setup,
  onOpen,
}: {
  setup: ApiSetupListItem;
  onOpen: (setup: ApiSetupListItem) => void;
}) {
  return (
    <div className="bg-surface border border-[#222]">
      <div className="relative w-full aspect-square">
        <img
          src={setup.imageUrl}
          alt={setup.name}
          className="w-full h-full object-cover block"
        />
        <button
          onClick={() => onOpen(setup)}
          className="absolute top-2 right-2 bg-black/50 border-0 text-white/60 hover:text-white/90 cursor-pointer p-1 transition-colors"
        >
          <Expand size={14} />
        </button>
      </div>
      <div className="px-2.5 pt-2.5 pb-2">
        <p className="font-serif text-[15px] font-medium text-text m-0 truncate">
          {setup.name}
        </p>
        <p className="text-[11px] tracking-[1.5px] uppercase text-[#555] font-sans mt-1 mb-0">
          ELO {setup.rating} · {setup.wins}W · {setup.losses}L
        </p>
      </div>
    </div>
  );
}
