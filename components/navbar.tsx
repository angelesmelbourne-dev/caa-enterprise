"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";


export default function Navbar() {
  const linksRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const links = linksRef.current?.querySelectorAll<HTMLElement>(
      "[data-proximity]"
    );
    if (!links) return;

    let closestLink: HTMLElement | null = null;
    let closestDistance = Infinity;

    links.forEach((link) => {
      const rect = link.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLink = link;
      }
    });

    const maxDistance = 75;

    links.forEach((link) => {
      link.classList.remove("is-near");

      if (link !== closestLink || closestDistance > maxDistance) {
        link.style.transform = "translate3d(0, 0, 0) scale(1)";
        return;
      }

      const rect = link.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const influence = 1 - closestDistance / maxDistance;

      link.style.transform =
        `translate3d(${(dx / maxDistance) * 5 * influence}px, ` +
        `${-5 * influence}px, 0) scale(${1 + 0.16 * influence})`;

      link.classList.add("is-near");
    });
  }

  function resetLinks() {
    const links = linksRef.current?.querySelectorAll<HTMLElement>(
      "[data-proximity]"
    );

    links?.forEach((link) => {
      link.style.transform = "translate3d(0, 0, 0) scale(1)";
      link.classList.remove("is-near");
    });
  }

  return (
    <div className="fixed left-0 right-0 top-4 z-50 flex justify-center px-4">
      <nav className="mx-auto w-full max-w-7xl rounded-2xl border border-green-900/10 bg-[#fbfcf8]/95 px-6 py-3 text-[#17251d] shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-6">
          <div className="flex h-12 shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="CA&A Enterprise"
              width={600}
              height={250}
              className="block h-12 w-auto object-contain"
            />
          </div>

          <div
            ref={linksRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetLinks}
            className="hidden items-center gap-18 md:flex"
          >
            <a data-proximity href="#products" className="transition-colors hover:text-green-600">
              Products
            </a>
            <a data-proximity href="#solutions" className="transition-colors hover:text-green-600">
              Solutions
            </a>
            <a data-proximity href="#videos" className="transition-colors hover:text-green-600">
              Videos
            </a>
            <a data-proximity href="#faq" className="transition-colors hover:text-green-600">
              FAQ
            </a>
          </div>

          <a
            href="https://m.me/YOURFACEBOOKPAGE"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[var(--brand-forest)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--brand-forest-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-lime)]/40"
          >
            Request Quote
          </a>
        </div>
      </nav>
    </div>
  );
}