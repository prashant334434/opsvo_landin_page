"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { nav } from "@/content";
import { createTopDockController, type TopDockOptions } from "./dock/topDockController";
import "./dock/command-bar.css";

const DOCK: TopDockOptions = { proximity: 122, spring: 0.19, damping: 0.7, widthGrowth: 17, heightGrowth: 16, drop: 3.5, axis: "x", lockTrack: true };

const ICONS: Record<string, ReactNode> = {
  "#how-it-works": <><circle cx="3" cy="8" r="1.5" /><circle cx="12.5" cy="3.5" r="1.5" /><circle cx="12.5" cy="12.5" r="1.5" /><path d="M4.5 7.3 11 4.2M4.5 8.7l6.5 3.1" /></>,
  "#compare": <><rect x="2" y="2.5" width="5" height="11" rx="1" /><rect x="9" y="2.5" width="5" height="11" rx="1" /></>,
  "#trust": <><path d="M8 1.9 13 3.8v4c0 3-2.2 5.2-5 6.3-2.8-1.1-5-3.3-5-6.3v-4z" /><path d="m5.8 8 1.6 1.6L10.4 6.6" /></>,
  "#retailers": <><path d="M8.6 2.2H13v4.4l-6.6 6.6a1.2 1.2 0 0 1-1.7 0L2.2 10.5a1.2 1.2 0 0 1 0-1.7z" /><circle cx="10.6" cy="4.6" r=".9" /></>,
  "#faq": <><circle cx="8" cy="8" r="5.9" /><path d="M6.4 6.3a1.7 1.7 0 1 1 2.4 1.6c-.5.3-.8.7-.8 1.3M8 11.2h.01" /></>,
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";
const quiet = `inline-flex min-h-tap items-center whitespace-nowrap rounded-md px-3 text-small text-secondary transition-colors duration-[120ms] hover:text-primary ${focusRing}`;
const primary = `inline-flex min-h-tap items-center justify-center whitespace-nowrap rounded-md bg-accent px-4 text-small font-medium text-surface transition-colors duration-[120ms] hover:bg-accent-hover ${focusRing}`;

export function SiteHeader() {
  const header = useRef<HTMLElement>(null);
  const dock = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signInNotice, setSignInNotice] = useState(false);

  useEffect(() => {
    const sections = nav.links.map((l) => document.querySelector(l.href)).filter((s): s is Element => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const first = sections[0];
    const onScroll = () => {
      if (first && first.getBoundingClientRect().top > innerHeight * 0.5) setActive(null);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    let last = scrollY;
    const hero = document.querySelector<HTMLElement>("[data-hero-track]");
    const onScroll = () => {
      const y = scrollY;
      if (Math.abs(y - last) < 6) return;
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - innerHeight : 0;
      setHidden(y > last && y > Math.max(80, heroEnd));
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => createTopDockController(dock.current!, () => DOCK), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [menuOpen]);

  const signIn = (className: string) => (
    <button
      type="button"
      onClick={() => setSignInNotice((v) => !v)}
      aria-expanded={signInNotice}
      aria-controls="sign-in-notice"
      className={className}
    >
      {nav.signIn.label}
    </button>
  );

  return (
    <header
      ref={header}
      className={`fixed inset-x-0 top-0 z-40 transition-[translate] focus-within:translate-y-0 ${
        hidden && !menuOpen ? "-translate-y-[calc(100%+2rem)]" : ""
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:border focus:border-border-strong focus:bg-surface focus:px-4 focus:py-2 focus:text-small focus:font-medium focus:text-primary"
      >
        Skip to main content
      </a>

      <div className="cmdbar-frame">
        <div className="cmdbar">
          <a href="#" className="cmdbar__brand">
            Opsvo
          </a>

          <nav ref={dock} aria-label="Primary" className="cmdbar__dock" data-dock-state="idle" data-dock-max="0.00">
            {nav.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-dock-item
                className="cmdbar__item"
                aria-label={l.label}
                aria-current={active === l.href ? "location" : undefined}
              >
                <span className="cmdbar__icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16">{ICONS[l.href]}</svg>
                </span>
                <span>{l.label}</span>
              </a>
            ))}
          </nav>

          <div className="cmdbar__actions">
            {signIn("cmdbar__ghost")}
            <a href={nav.cta.href} className="cmdbar__cta" aria-label={nav.cta.label}>
              <span>{nav.cta.label}</span>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.2 8h9.1M8.6 4.3 12.4 8l-3.8 3.7" />
              </svg>
            </a>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="cmdbar__menu"
            >
              <span aria-hidden="true" className="relative block h-3 w-4">
                <span className={`absolute left-0 block h-0 w-4 border-t-2 border-primary transition-transform ${menuOpen ? "top-1 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 block h-0 w-4 border-t-2 border-primary transition-transform ${menuOpen ? "top-1 -rotate-45" : "top-2"}`} />
              </span>
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="site-menu" className="mx-auto mt-2 w-(--atd-bar-width) min-[600px]:hidden">
            <div className="rounded-lg border border-border bg-surface/90 p-2 shadow-lg backdrop-blur-xl">
              <nav aria-label="Primary">
                <ul>
                  {nav.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active === l.href ? "location" : undefined}
                        className={`flex min-h-tap items-center rounded-md px-3 text-body transition-colors duration-[120ms] hover:bg-subtle ${focusRing} ${
                          active === l.href ? "bg-subtle font-medium text-primary" : "text-secondary"
                        }`}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                {signIn(quiet)}
                <a href={nav.cta.href} onClick={() => setMenuOpen(false)} className={primary}>
                  {nav.cta.label}
                </a>
              </div>
            </div>
          </div>
        )}

        {signInNotice && (
          <div id="sign-in-notice" role="status" className="mx-auto mt-2 w-(--atd-bar-width)">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface/90 px-3 py-2 text-small text-secondary backdrop-blur-md">
              <p>Sign in is not available during early access.</p>
              <button
                type="button"
                onClick={() => setSignInNotice(false)}
                className={`min-h-tap shrink-0 rounded-sm px-2 text-label font-medium text-primary hover:underline ${focusRing}`}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
