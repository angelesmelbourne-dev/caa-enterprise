"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";

const navLinks = [
  { label: "Products", href: "#products" },
  { label: "Solutions", href: "#solutions" },
  { label: "Videos", href: "#videos" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const linksRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const links = linksRef.current?.querySelectorAll<HTMLElement>("[data-proximity]");
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
    const links = linksRef.current?.querySelectorAll<HTMLElement>("[data-proximity]");
    links?.forEach((link) => {
      link.style.transform = "translate3d(0, 0, 0) scale(1)";
      link.classList.remove("is-near");
    });
  }

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      menuButtonRef.current?.focus();
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-4 z-50 flex justify-center px-3 sm:px-4">
        <nav
          aria-label="Main navigation"
          className="mx-auto w-full max-w-7xl rounded-2xl border border-green-900/10 bg-[#fbfcf8]/95 px-3 py-2.5 text-[#17251d] shadow-sm backdrop-blur sm:px-6 sm:py-3"
        >
          <div className="flex items-center justify-between gap-2 sm:gap-6">
            <a href="#top" aria-label="CA&A Enterprise home" className="flex h-11 shrink-0 items-center sm:h-12">
              <Image
                src="/logo.png"
                alt="CA&A Enterprise"
                width={600}
                height={250}
                priority
                className="block h-10 w-auto object-contain sm:h-12"
              />
            </a>

            <div
              ref={linksRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetLinks}
              className="hidden items-center gap-8 lg:flex xl:gap-12"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  data-proximity
                  href={link.href}
                  className="transition-colors hover:text-green-700"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <a
                href="https://m.me/YOURFACEBOOKPAGE"
                target="_blank"
                rel="noopener noreferrer"
                className="orbit-cta navbar-orbit-cta"
              >
                Request Quote
              </a>

              <button
                ref={menuButtonRef}
                type="button"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation-drawer"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-lime)]/40 lg:hidden"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                  {menuOpen ? (
                    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  ) : (
                    <path d="M4 7h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="mobile-nav-backdrop fixed inset-0 z-[60] cursor-default bg-[#10251a]/35 backdrop-blur-[2px]"
          />

          <aside
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="mobile-nav-drawer fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,88vw)] flex-col border-l border-[var(--border)] bg-[#fbfcf8] p-6 text-[var(--foreground)] shadow-2xl"
          >
            <div className="mb-10 flex items-center justify-between">
              <Image
                src="/logo.png"
                alt="CA&A Enterprise"
                width={600}
                height={250}
                className="h-10 w-auto object-contain"
              />
              <a
                href="https://m.me/YOURFACEBOOKPAGE"
                target="_blank"
                rel="noopener noreferrer"
                className="orbit-cta navbar-orbit-cta mobile-navigation-quote-top mx-2"
              >
                Request Quote
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation menu"
                className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-lime)]/40"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Explore
            </p>
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Explore CA&amp;A
            </p>
            <nav aria-label="Mobile navigation links" className="flex flex-col">
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between border-b border-[var(--border)] px-3 py-4 text-base font-medium transition-colors hover:text-[var(--brand-forest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-lime)]"
                >
                  <span>{link.label}</span>
                  <span className="text-sm font-normal tabular-nums text-[var(--text-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
              <p className="text-sm text-[var(--text-muted)]">Need help choosing the right setup?</p>
              <a
                href="https://m.me/YOURFACEBOOKPAGE"
                target="_blank"
                rel="noopener noreferrer"
                className="orbit-cta mt-4 w-full"
              >
                Request Quote
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}