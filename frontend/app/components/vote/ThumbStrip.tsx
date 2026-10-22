type Props = {
  name: string;
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  className?: string;
};

export default function ThumbStrip({
  name,
  photos,
  index,
  onIndexChange,
  className = "",
}: Props) {
  return (
    <div
      role="group"
      aria-label={`Photos of ${name}`}
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {/* Shown even for a single photo, so both sides of a battle line up */}
      {photos.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onIndexChange(i)}
          aria-label={`Show photo ${i + 1} of ${photos.length}`}
          aria-current={i === index}
          className={`h-[42px] w-14 cursor-pointer overflow-hidden rounded-xs transition-opacity lg:h-12 lg:w-16 ${
            i === index
              ? "ring-1 ring-accent ring-offset-2 ring-offset-bg"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          <img src={src} alt="" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
