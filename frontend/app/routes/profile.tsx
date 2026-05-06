import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getSetups } from "~/api/setup";
import type { ApiSetupListItem } from "~/api/types";
import SetupDetailModal from "~/components/setup/SetupDetailModal";

export default function Profile() {
  const [setups, setSetups] = useState<ApiSetupListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSetup, setSelectedSetup] = useState<ApiSetupListItem | null>(null);

  useEffect(() => {
    getSetups()
      .then(setSetups)
      .catch(console.error)
      .finally(() => setIsLoading(false));
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
      <div className="px-6 py-8">
        <p className="text-[11px] tracking-[2.5px] uppercase text-muted font-sans mb-4">
          My Setups
        </p>

        <div className="grid grid-cols-4 gap-4">
          {setups.map((setup) => (
            <div
              key={setup.id}
              onClick={() => setSelectedSetup(setup)}
              className="bg-[#161616] border border-[#222] cursor-pointer"
            >
              <img
                src={setup.imageUrl}
                alt={setup.name}
                className="w-full aspect-square object-cover block"
              />
              <div className="px-[10px] pt-[10px] pb-2">
                <p className="font-serif text-[15px] font-medium text-[#e8e8e8] m-0 truncate">
                  {setup.name}
                </p>
                <p className="text-[11px] tracking-[1.5px] uppercase text-[#555] font-sans mt-1 mb-0">
                  ELO {setup.rating} · {setup.wins}W · {setup.losses}L
                </p>
              </div>
            </div>
          ))}

          {/* Add Setup shortcut — always last */}
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
