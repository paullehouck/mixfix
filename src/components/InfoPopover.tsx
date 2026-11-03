import { useEffect, useId, useRef, useState } from "react";

export interface InfoPopoverProps {
  text: string;
  label?: string;
}

export function InfoPopover({ text, label = "More information" }: InfoPopoverProps) {
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
    <div className="relative inline-flex items-center">
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
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-base text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent,#1c1917)]"
      >
        <span aria-hidden="true">ⓘ</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label={label}
          className="absolute top-full left-0 z-30 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-3.5 text-sm leading-relaxed text-stone-700 shadow-lg sm:left-auto sm:right-0"
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default InfoPopover;

