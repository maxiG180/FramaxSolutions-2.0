"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const BB_NAILS = "/portfolio/prints/bbnailsprint.jpg";
const CLINICA = "/portfolio/prints/clinicaalvesprint.jpg";
const CLINICA_2 = "/portfolio/prints/clinicaalvesprint2.jpg";
const PEROLA = "/portfolio/prints/peroladovougaprint.jpg";

// Background wall of real client work. Each column renders its list twice
// so translating it by -50% loops seamlessly.
const WALL_COLUMNS = [
  { shots: [BB_NAILS, CLINICA_2, PEROLA, CLINICA], duration: 70, reverse: false, className: "" },
  { shots: [PEROLA, CLINICA, BB_NAILS, CLINICA_2], duration: 85, reverse: true, className: "" },
  { shots: [CLINICA_2, BB_NAILS, CLINICA, PEROLA], duration: 75, reverse: false, className: "hidden md:block" },
];

const RECENT_WORK = ["Clínica Alves", "Pérola do Vouga", "BB Nails"];

const shade = (percent: number) => `color-mix(in srgb, var(--background) ${percent}%, transparent)`;

const WorkWall = () => (
  <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
    <div className="absolute -inset-x-[10%] -inset-y-[30%] grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 -rotate-[8deg] opacity-[0.26]">
      {WALL_COLUMNS.map((column, i) => (
        <div key={i} className={column.className}>
          <div
            className="hero-wall-col"
            data-reverse={column.reverse}
            style={{ animationDuration: `${column.duration}s` }}
          >
            {[...column.shots, ...column.shots].map((src, j) => (
              <div key={j} className="pb-4 md:pb-6">
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  decoding="async"
                  className="w-full aspect-video object-cover object-top rounded-lg md:rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Darken behind the copy, fade into the header and the next section.
        --background is a CSS var, so Tailwind's /opacity modifiers can't be used here. */}
    <div className="absolute inset-0 md:hidden" style={{ background: shade(65) }} />
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

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col bg-background overflow-hidden"
    >
      <WorkWall />

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
                href="/#booking"
                className="group inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors"
              >
                {t.hero.bookMeeting}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#portfolio"
                className="text-base font-medium text-neutral-300 hover:text-white underline-offset-8 hover:underline transition-colors"
              >
                {t.hero.viewWork}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-white/10 text-sm">
            <span className="text-neutral-500">{t.hero.recentWork}</span>
            {RECENT_WORK.map((name) => (
              <span key={name} className="text-neutral-300">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
