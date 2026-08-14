import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Options {
  /** Called when Escape is pressed (the caller closes and restores focus). */
  onEscape: () => void;
  /** Element to focus when the trap activates; defaults to the first focusable. */
  initialFocus?: RefObject<HTMLElement | null>;
}

/**
 * Keeps Tab focus inside `containerRef` while `active`, moves focus in on open,
 * and closes on Escape. Shared by the mobile navigation sheet and the command
 * palette so both behave identically for keyboard and screen-reader users.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  { onEscape, initialFocus }: Options,
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const items = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    (initialFocus?.current ?? items()[0])?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = items();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [active]);
}

/** True when a keyboard event targets a text field, so global shortcuts (Undo,
 *  ⌘K, …) do not hijack native editing inside the composer forms. */
export function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}
