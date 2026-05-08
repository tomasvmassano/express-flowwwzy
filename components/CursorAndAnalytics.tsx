"use client";

import { useEffect } from "react";

export default function CursorAndAnalytics() {
  useEffect(() => {
    const cursor = document.getElementById("cream-cursor");
    if (!cursor) return;
    if (window.matchMedia("(max-width: 991px)").matches) return;

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      const t = e.target as HTMLElement;
      const interactive = t.closest("[data-cursor='view'],[data-cursor='interactive'],a,button,[role='button']");
      if (interactive) {
        cursor.classList.add("active");
        if (interactive.getAttribute("data-cursor") === "view") {
          cursor.classList.add("large");
          cursor.textContent = interactive.getAttribute("data-cursor-label") || "VIEW";
        } else {
          cursor.classList.remove("large");
          cursor.textContent = "";
        }
      } else {
        cursor.classList.remove("active");
        cursor.classList.remove("large");
        cursor.textContent = "";
      }
    };

    const tick = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.left = `${curX}px`;
      cursor.style.top = `${curY}px`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return null;
}
