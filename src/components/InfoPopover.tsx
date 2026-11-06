import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface InfoPopoverProps {
  text: ReactNode;
  label?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function InfoPopover({
  text,
  label = "More information",
  imageSrc,
  imageAlt = "",
}: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (
        target &&
        !popoverRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  return (
    <div className="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px]">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (!next) {
              triggerRef.current?.focus();
            }
            return next;
          });
        }}
        className="w-6 h-6 rounded-full border-2 border-[#1E1E24] bg-white font-display text-[10.5px] flex items-center justify-center text-[#1E1E24] hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 transition-all focus-visible:outline-none"
      >
        <span aria-hidden="true" className="leading-none select-none">i</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label={label}
          className={`absolute top-full right-0 z-30 mt-2 max-w-[calc(100vw-2rem)] bg-white brutal-border brutal-shadow rounded-xl p-3.5 text-xs sm:text-sm font-body text-[#1E1E24] ${
            imageSrc
              ? "w-[360px] sm:w-[420px] flex items-center gap-3.5"
              : "w-72 max-w-[280px]"
          }`}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-1/2 shrink-0 aspect-square rounded-lg object-contain object-center"
            />
          )}
          <div className="flex-1 min-w-0 leading-snug">{text}</div>
        </div>
      )}
    </div>
  );
}

export default InfoPopover;

