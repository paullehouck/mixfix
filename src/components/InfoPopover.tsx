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
        className="w-8 h-8 rounded-full brutal-border bg-white font-display text-xs flex items-center justify-center text-[#1E1E24] hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 transition-all focus-visible:outline-none"
      >
        <span aria-hidden="true">ⓘ</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label={label}
          className="absolute top-full right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white brutal-border brutal-shadow rounded-xl p-4 text-sm font-body max-w-[280px] text-[#1E1E24]"
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default InfoPopover;

