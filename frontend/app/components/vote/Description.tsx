import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
};

// Always takes exactly 2 lines (even when shorter), so both sides of a battle
// stay aligned. Longer text gets "… more"
export default function Description({ text, className = "" }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isExpanded) return;

    const check = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, isExpanded]);

  return (
    <div className={`relative min-w-0 ${className}`}>
      <p
        ref={ref}
        className={`text-sm leading-[22px] text-dim ${
          isExpanded ? "" : "line-clamp-2 h-11"
        }`}
      >
        {text}
      </p>
      {!isExpanded && isClamped && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="absolute bottom-0 right-0 h-[22px] cursor-pointer bg-bg pl-2 text-sm text-accent"
        >
          … more
        </button>
      )}
      {isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="mt-1 h-[22px] cursor-pointer text-sm text-accent"
        >
          Show less
        </button>
      )}
    </div>
  );
}
