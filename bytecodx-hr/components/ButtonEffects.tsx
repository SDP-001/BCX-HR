"use client";

import { useEffect } from "react";

export function ButtonEffects() {
  useEffect(() => {
    let activeButton: HTMLElement | null = null;

    function resetButton() {
      activeButton?.style.removeProperty("--mag-x");
      activeButton?.style.removeProperty("--mag-y");
      activeButton = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(".button-magnetic")
        : null;
      if (target !== activeButton) resetButton();
      if (!target || event.pointerType === "touch") return;

      const bounds = target.getBoundingClientRect();
      activeButton = target;
      target.style.setProperty("--mag-x", `${(event.clientX - bounds.left - bounds.width / 2) * 0.08}px`);
      target.style.setProperty("--mag-y", `${(event.clientY - bounds.top - bounds.height / 2) * 0.08}px`);
    }

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", resetButton, true);
    window.addEventListener("blur", resetButton);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", resetButton, true);
      window.removeEventListener("blur", resetButton);
      resetButton();
    };
  }, []);

  return null;
}
