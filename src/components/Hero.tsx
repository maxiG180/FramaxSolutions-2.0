"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, TrendingUp, ShoppingCart, Users, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Typewriter = ({ text }: { text: string[] }) => {
  const [index, setIndex] = React.useState(0);
  const [subIndex, setSubIndex] = React.useState(0);
  const [reverse, setReverse] = React.useState(false);
  const [blink, setBlink] = React.useState(true);

  React.useEffect(() => {
    if (index >= text.length) {
      setIndex(0); // Loop back
      return;
    }

    if (subIndex === text[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 2000); // Wait before deleting
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % text.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 75 : subIndex === text[index].length ? 2000 : 150, Math.floor(Math.random() * 350)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, text]);

  // Cursor blink
  React.useEffect(() => {
    const timeout2 = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(timeout2);
  }, []);

  return (
    <span className="relative inline-block text-blue-500">
      {`${text[index].substring(0, subIndex)}`}
      <span className={`${blink ? "opacity-100" : "opacity-0"} absolute top-0 -right-2 text-blue-500`}>|</span>
      <svg
        className="absolute w-full h-3 sm:h-4 -bottom-1 sm:-bottom-2 left-0 text-blue-500"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 5 L100 5"
          fill="transparent"
          strokeWidth="8"
          stroke="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        />
      </svg>
    </span>
  );
};

const Hero = () => {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width - 0.5);
    y.set((clientY - top) / height - 0.5);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center bg-background py-20 sm:py-24 lg:py-32 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Subtle Radial Accent */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.15] dark:opacity-[0.08]">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px]" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">

          {/* Left Content */}
          <div className="space-y-12 text-center lg:text-left">

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-foreground">
                {t.hero.titlePre}
                <br />
                <Typewriter text={t.hero.dynamicKeywords || [t.hero.titleHighlight]} />
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center lg:justify-start"
            >
              <Link
                href="/#booking"
                className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white bg-primary rounded-full hover:scale-105 transition-transform duration-200"
              >
                {t.hero.bookMeeting}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>

          {/* Mobile Visual - Bento Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:hidden relative"
          >
            {/* "This Could Be You" Label with Curly Bracket */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex flex-col items-center gap-1 mb-6"
            >
              <span className="text-xs font-bold text-white bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                {t.hero.couldBeYou}
              </span>
              {/* Professional Horizontal Curly Bracket pointing up from cards */}
              <svg className="w-full h-10" viewBox="0 0 400 50" fill="none" preserveAspectRatio="xMidYMid meet">
                <path
                  d="M 20 45 Q 20 35, 30 35 L 180 35 Q 190 35, 195 30 Q 200 25, 205 30 Q 210 35, 220 35 L 370 35 Q 380 35, 380 45"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  className="text-primary"
                />
              </svg>
            </motion.div>

            {/* Bento Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">

              {/* Card 1: More Customers */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.6 }}
                className="relative bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-xl rounded-xl border border-blue-500/20 p-4 overflow-hidden"
              >
                <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-xs font-semibold text-white mb-1">{t.hero.moreClients}</div>
                <div className="text-xl font-bold text-blue-400">+127%</div>

                {/* Simple arrow going up */}
                <div className="absolute bottom-2 right-2 w-12 h-12">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <svg className="w-10 h-10 text-blue-500/40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Card 2: Always Online */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.7 }}
                className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-xl rounded-xl border border-yellow-500/20 p-4 overflow-hidden"
              >
                <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                <div className="text-xs font-semibold text-white mb-1">{t.hero.alwaysOpen}</div>
                <div className="text-[10px] text-slate-400">{t.hero.alwaysOnline}</div>

                {/* Pulsing dot */}
                <div className="absolute bottom-2 right-2">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-yellow-500"
                  />
                </div>
              </motion.div>

              {/* Card 3: Website Preview (Tall) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.8 }}
                className="row-span-2 relative bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-900 p-3 flex flex-col">
                  {/* Browser header */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 h-3 bg-slate-800/50 rounded text-[7px] text-slate-500 flex items-center px-1.5">
                      seunegocio.com
                    </div>
                  </div>

                  {/* Hero mockup */}
                  <div className="flex-1 space-y-2">
                    <div className="text-center space-y-1.5">
                      <div className="text-[10px] font-bold text-white">{t.hero.yourBusiness}</div>
                      <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-slate-600 to-transparent rounded" />
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      className="mx-auto w-20 h-6 bg-primary rounded-md shadow-lg shadow-primary/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="text-[8px] font-bold text-white">{t.hero.learnMore}</div>
                    </motion.div>

                    {/* Image placeholders */}
                    <div className="grid grid-cols-2 gap-1.5 mt-3">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="aspect-square bg-slate-800/50 rounded-md"
                        />
                      ))}
                    </div>

                    {/* Info section */}
                    <div className="space-y-1 pt-2">
                      <div className="h-1 bg-slate-800/60 rounded w-3/4" />
                      <div className="h-1 bg-slate-800/60 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Business Growth */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.9 }}
                className="relative bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-xl rounded-xl border border-orange-500/20 p-4 overflow-hidden"
              >
                <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
                <div className="text-xs font-semibold text-white mb-1">{t.hero.growth}</div>
                <div className="text-xl font-bold text-orange-400">+250%</div>

                {/* Growth chart */}
                <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end gap-0.5 px-2 pb-2">
                  {[30, 40, 35, 55, 50, 70, 95].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-orange-500/40 rounded-t"
                      initial={{ height: 0 }}
                      animate={isInView ? { height: `${height}%` } : { height: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 + i * 0.1 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Card 5: Google Reviews */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 1 }}
                className="relative bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-xl rounded-xl border border-green-500/20 p-4 overflow-hidden"
              >
                {/* Header with Google branding */}
                <div className="relative z-10 mb-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-xs font-semibold text-white">{t.hero.reviews}</span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <div className="text-2xl font-bold text-green-400">4.9</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                          transition={{ delay: 1.3 + i * 0.08, type: "spring", stiffness: 200 }}
                          className="w-3 h-3 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </motion.svg>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews count indicator */}
                <div className="text-[9px] text-slate-400 mt-1">{t.hero.reviewsCount}</div>
              </motion.div>

            </div>

            {/* Floating Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          </motion.div>

          {/* Right Visual - Business Benefits Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block relative h-[600px]"
          >
            {/* "This Could Be You" Label with Horizontal Curly Bracket */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute -top-20 left-0 right-0 flex flex-col items-center gap-1"
            >
              <span className="text-sm font-bold text-white bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                {t.hero.couldBeYou}
              </span>
              {/* Professional Horizontal Curly Bracket pointing up from cards */}
              <svg className="w-full h-12" viewBox="0 0 400 50" fill="none" preserveAspectRatio="xMidYMid meet">
                <path
                  d="M 20 45 Q 20 35, 30 35 L 180 35 Q 190 35, 195 30 Q 200 25, 205 30 Q 210 35, 220 35 L 370 35 Q 380 35, 380 45"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  className="text-primary"
                />
              </svg>
            </motion.div>

            <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-4">

              {/* Card 1: More Customers - Top Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.6 }}
                className="relative bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 overflow-hidden group hover:border-blue-500/40 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <TrendingUp className="w-10 h-10 text-blue-500 mb-2 relative z-10" />
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-white mb-1">{t.hero.moreClients}</div>
                  <div className="text-2xl font-bold text-blue-400">+127%</div>
                </div>

                {/* Simple arrow going up */}
                <div className="absolute bottom-4 right-4 w-16 h-16">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <svg className="w-12 h-12 text-blue-500/40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Card 2: Your Website - Top Right (Tall) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.7 }}
                className="row-span-2 relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden group"
              >
                {/* Website Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-900 p-4 flex flex-col">
                  {/* Browser header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/60" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                      <div className="w-2 h-2 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 h-4 bg-slate-800/50 rounded text-[8px] text-slate-500 flex items-center px-2">
                      seunegocio.com
                    </div>
                  </div>

                  {/* Hero mockup */}
                  <div className="flex-1 space-y-3">
                    <div className="text-center space-y-2">
                      <div className="text-xs font-bold text-white">{t.hero.yourBusiness}</div>
                      <div className="w-full h-2 bg-gradient-to-r from-transparent via-slate-600 to-transparent rounded" />
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      className="mx-auto w-32 h-9 bg-primary rounded-lg shadow-lg shadow-primary/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="text-[10px] font-bold text-white">{t.hero.learnMore}</div>
                    </motion.div>

                    {/* Image placeholders */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="aspect-square bg-slate-800/50 rounded-lg"
                        />
                      ))}
                    </div>

                    {/* Info section */}
                    <div className="space-y-1.5 pt-2">
                      <div className="h-1.5 bg-slate-800/60 rounded w-3/4" />
                      <div className="h-1.5 bg-slate-800/60 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Always Online - Middle Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.8 }}
                className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-xl rounded-2xl border border-yellow-500/20 p-6 overflow-hidden group hover:border-yellow-500/40 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="w-10 h-10 text-yellow-500 mb-2 relative z-10" />
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-white mb-1">{t.hero.alwaysOpen}</div>
                  <div className="text-xs text-slate-400">{t.hero.alwaysOnline}</div>
                </div>
                {/* Pulsing dot */}
                <div className="absolute bottom-4 right-4">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 rounded-full bg-yellow-500"
                  />
                </div>
              </motion.div>

              {/* Card 4: Business Growth - Bottom Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.9 }}
                className="relative bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-6 overflow-hidden group hover:border-orange-500/40 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <TrendingUp className="w-10 h-10 text-orange-500 mb-2 relative z-10" />
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-white mb-1">{t.hero.growth}</div>
                  <div className="text-2xl font-bold text-orange-400">+250%</div>
                </div>
                {/* Growth chart */}
                <div className="absolute bottom-0 left-0 right-0 h-10 flex items-end gap-0.5 px-3 pb-3">
                  {[30, 40, 35, 55, 50, 70, 95].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-orange-500/40 rounded-t"
                      initial={{ height: 0 }}
                      animate={isInView ? { height: `${height}%` } : { height: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 + i * 0.1 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Card 5: Google Reviews - Bottom Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 1 }}
                className="relative bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6 overflow-hidden group hover:border-green-500/40 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Header with Google branding */}
                <div className="relative z-10 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">{t.hero.reviews}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-green-400">4.9</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                          transition={{ delay: 1.3 + i * 0.08, type: "spring", stiffness: 200 }}
                          className="w-4 h-4 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </motion.svg>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews popping up */}
                <div className="relative mt-4 h-20 overflow-hidden flex items-center">
                  {[
                    { name: t.hero.review1Name, text: t.hero.review1Text, delay: 2.5 },
                    { name: t.hero.review2Name, text: t.hero.review2Text, delay: 7 },
                    { name: t.hero.review3Name, text: t.hero.review3Text, delay: 11.5 }
                  ].map((review, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-0 right-0 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2.5 border border-green-500/20 shadow-lg"
                      initial={{ y: 100, opacity: 0 }}
                      animate={isInView ? {
                        y: [100, -10, -10, -120],
                        opacity: [0, 1, 1, 0]
                      } : { y: 100, opacity: 0 }}
                      transition={{
                        duration: 4.5,
                        delay: review.delay,
                        repeat: Infinity,
                        times: [0, 0.2, 0.8, 1],
                        ease: "easeInOut",
                        repeatDelay: 9
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white">{review.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="text-xs font-semibold text-white">{review.name}</div>
                            <div className="flex gap-0.5 shrink-0">
                              {[...Array(5)].map((_, j) => (
                                <svg key={j} className="w-2.5 h-2.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-300 line-clamp-2">{review.text}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* Floating Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};



export default Hero;
