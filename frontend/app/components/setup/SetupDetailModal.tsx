import { useEffect } from "react";
import type { ApiSetupListItem } from "~/api/types";

type Props = {
  setup: ApiSetupListItem;
  onClose: () => void;
};

export default function SetupDetailModal({ setup, onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const addedDate = new Date(setup.createdAt).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-surface border border-[#222] flex max-w-200 w-full"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-3 bg-transparent border-0 text-[#555] text-[18px] leading-none cursor-pointer"
        >
          ×
        </button>

        {/* Image */}
        <img
          src={setup.imageUrl}
          alt={setup.name}
          className="w-90 min-w-55 aspect-square object-cover block"
        />

        {/* Details */}
        <div className="flex flex-col gap-2.5 p-5 min-w-0">
          <p className="font-serif text-[20px] font-semibold text-text m-0">
            {setup.name}
          </p>

          <p className="font-sans text-[13px] text-muted m-0 leading-relaxed">
            {setup.description}
          </p>

          <p className="font-sans text-[11px] tracking-[1.5px] uppercase text-[#555] m-0">
            {setup.wins}W · {setup.losses}L · ELO {setup.rating}
          </p>

          <p className="font-sans text-[11px] tracking-[1.5px] uppercase text-[#444] m-0">
            Added {addedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
