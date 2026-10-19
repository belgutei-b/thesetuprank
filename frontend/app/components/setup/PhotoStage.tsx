import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSwipe } from "~/hooks/useSwipe";

type Props = {
  name: string;
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  onExpand: () => void;
  // What clicking the photo itself does: picks it on the vote page, opens it
  // full size on the rankings page. Leave it out and the photo isn't clickable
  onSelect?: () => void;
  selectLabel?: string;
  size?: "large" | "small";
  isDimmed?: boolean;
  // Shown in the top-left corner (the vote result)
  badge?: ReactNode;
  className?: string;
};

// Literal class names so Tailwind picks them up
const SIZES = {
  large: {
    frame: "aspect-[16/10] sm:aspect-[4/3]",
    // visible on phones too: tapping the photo picks it there, so these and
    // swiping are the only ways to browse
    button: "icon",
    visibility: "",
    left: "left-2.5",
    right: "right-2.5",
    top: "top-2.5",
    bottom: "bottom-2.5",
    chevron: 20,
    expand: 16,
  },
  small: {
    frame: "aspect-[4/3]",
    // too small for touch targets on phones: swipe there, or tap to open it
    // full size
    button: "icon-xs",
    visibility: "hidden sm:inline-flex",
    left: "left-1.5",
    right: "right-1.5",
    top: "top-1.5",
    bottom: "bottom-1.5",
    chevron: 16,
    expand: 14,
  },
} as const;

// Shows one photo at a time without cropping it. Every photo gets the same
// frame, so a portrait photo next to a landscape one is still a fair comparison
export default function PhotoStage({
  name,
  photos,
  index,
  onIndexChange,
  onExpand,
  onSelect,
  selectLabel,
  size = "large",
  isDimmed = false,
  badge,
  className = "",
}: Props) {
  const count = photos.length;
  const hasMany = count > 1;
  const s = SIZES[size];

  function go(step: number) {
    if (!hasMany) return;
    onIndexChange((index + step + count) % count);
  }

  const swipe = useSwipe(go);

  const controlClass = `absolute ${s.visibility}`;

  return (
    <div className={`min-w-0 ${className}`}>
      <div
        className={`relative w-full overflow-hidden rounded-xs bg-surface ${s.frame}`}
        {...swipe}
      >
        <button
          type="button"
          onClick={onSelect}
          disabled={!onSelect}
          aria-label={selectLabel}
          className="absolute inset-0 rounded-xs outline-accent -outline-offset-2 focus-visible:outline-2 enabled:cursor-pointer enabled:hover:outline-2"
        >
          <img
            src={photos[index]}
            alt={`${name}, photo ${index + 1} of ${count}`}
            draggable={false}
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              isDimmed ? "opacity-45" : ""
            }`}
          />
        </button>

        {badge && (
          <div className={`pointer-events-none absolute ${s.left} ${s.top}`}>
            {badge}
          </div>
        )}

        {hasMany && (
          <>
            <Button
              variant="overlay"
              size={s.button}
              onClick={() => go(-1)}
              aria-label={`Previous photo of ${name}`}
              className={`${controlClass} ${s.left} top-1/2 -translate-y-1/2`}
            >
              <ChevronLeft size={s.chevron} />
            </Button>
            <Button
              variant="overlay"
              size={s.button}
              onClick={() => go(1)}
              aria-label={`Next photo of ${name}`}
              className={`${controlClass} ${s.right} top-1/2 -translate-y-1/2`}
            >
              <ChevronRight size={s.chevron} />
            </Button>

            {/* Phone: dots. Tablet and desktop: a counter */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute ${s.right} ${s.bottom} flex gap-1.5 bg-black/60 px-2 py-1.5 sm:hidden`}
            >
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i === index ? "w-3.5 bg-text" : "w-1.5 bg-text/45"
                  }`}
                />
              ))}
            </div>
            <span
              className={`pointer-events-none absolute ${s.right} ${s.bottom} hidden bg-black/75 px-2 py-0.5 text-xs tabular-nums text-text sm:block`}
            >
              {index + 1} / {count}
            </span>
          </>
        )}

        <Button
          variant="overlay"
          size={s.button}
          onClick={onExpand}
          aria-label={`View ${name} full size`}
          className={`${controlClass} ${s.right} ${s.top}`}
        >
          <Expand size={s.expand} />
        </Button>
      </div>
    </div>
  );
}
