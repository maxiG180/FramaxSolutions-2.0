"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage, useLocalePath } from "@/context/LanguageContext";

type FeedItem = { app: string; event: string; result: string };

// Fixed times so server and client render the same markup
const FEED_TIMES = ["09:02", "09:05", "09:11", "09:14", "09:20", "09:26", "09:31", "09:38", "09:44", "09:52"];

// Each column starts at a different point in the feed and renders it twice,
// so translating it by -50% loops seamlessly.
const WALL_COLUMNS = [
  { offset: 0, duration: 110, reverse: false, className: "" },
  { offset: 4, duration: 130, reverse: true, className: "" },
  { offset: 7, duration: 120, reverse: false, className: "hidden md:block" },
  { offset: 2, duration: 140, reverse: true, className: "hidden lg:block" },
];

const shade = (percent: number) => `color-mix(in srgb, var(--background) ${percent}%, transparent)`;

const FeedCard = ({ item, time }: { item: FeedItem; time: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
    <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {item.app}
      </span>
      <span>{time}</span>
    </div>
    <p className="mt-3 text-base text-neutral-200">{item.event}</p>
    <p className="mt-1.5 flex items-center gap-2 text-sm text-emerald-400">
      <Check className="h-4 w-4 shrink-0" />
      {item.result}
    </p>
  </div>
);

// Background: a slow-moving feed of everyday tasks that software handles for a business
const AutomationWall = ({ feed }: { feed: FeedItem[] }) => (
  <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
    <div className="absolute -inset-x-[10%] -inset-y-[30%] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 -rotate-[8deg] opacity-50">
      {WALL_COLUMNS.map((column, i) => {
        const indices = feed.map((_, j) => (j + column.offset) % feed.length);
        return (
          <div key={i} className={column.className}>
            <div
              className="hero-wall-col"
              data-reverse={column.reverse}
              style={{ animationDuration: `${column.duration}s` }}
            >
              {[...indices, ...indices].map((feedIndex, j) => (
                <div key={j} className="pb-4 md:pb-6">
                  <FeedCard item={feed[feedIndex]} time={FEED_TIMES[feedIndex % FEED_TIMES.length]} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>

    {/* Darken behind the copy, fade into the header and the next section.
        --background is a CSS var, so Tailwind's /opacity modifiers can't be used here. */}
    <div className="absolute inset-0 md:hidden" style={{ background: shade(75) }} />
    <div
      className="absolute inset-0 hidden md:block"
      style={{ background: `linear-gradient(to right, ${shade(100)} 0%, ${shade(85)} 40%, ${shade(35)} 100%)` }}
    />
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(to bottom, ${shade(70)} 0%, ${shade(0)} 30%, ${shade(0)} 65%, ${shade(100)} 100%)` }}
    />
  </div>
);

const Hero = () => {
  const { t } = useLanguage();
  const localePath = useLocalePath();

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden"
    >
      <AutomationWall feed={t.hero.automationFeed} />

      <div className="relative z-10 flex-1 flex items-center pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 mb-8 text-sm font-medium tracking-wide text-neutral-400">
              <span className="h-px w-8 bg-primary" />
              {t.hero.badge}
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] text-foreground">
              {t.hero.titlePre}{" "}
              <br />
              <span className="text-primary">{t.hero.titleHighlight}.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg sm:text-xl leading-relaxed text-neutral-400">
              {t.hero.subtitle}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={localePath("/#booking")}
                className="group inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors"
              >
                {t.hero.bookMeeting}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={localePath("/#features")}
                className="text-base font-medium text-neutral-300 hover:text-white underline-offset-8 hover:underline transition-colors"
              >
                {t.hero.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-white/10 text-sm">
            <span className="text-neutral-500">{t.hero.buildLabel}</span>
            {t.hero.buildItems.map((item) => (
              <span key={item} className="text-neutral-300">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
