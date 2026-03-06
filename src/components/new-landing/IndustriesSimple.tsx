'use client';

import { useEffect, useRef } from 'react';
import { Scissors, Dumbbell, Stethoscope, Wrench } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function IndustriesSimple() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.industry-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.4)',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const industries = [
    {
      icon: <Scissors className="w-12 h-12" />,
      name: 'Salões & Barbearias',
      color: 'from-pink-500/10 to-pink-500/5',
      border: 'border-pink-500/20',
      iconBg: 'bg-pink-500/20 text-pink-400',
    },
    {
      icon: <Dumbbell className="w-12 h-12" />,
      name: 'Ginásios & Studios',
      color: 'from-orange-500/10 to-orange-500/5',
      border: 'border-orange-500/20',
      iconBg: 'bg-orange-500/20 text-orange-400',
    },
    {
      icon: <Stethoscope className="w-12 h-12" />,
      name: 'Clínicas & Consultórios',
      color: 'from-green-500/10 to-green-500/5',
      border: 'border-green-500/20',
      iconBg: 'bg-green-500/20 text-green-400',
    },
    {
      icon: <Wrench className="w-12 h-12" />,
      name: 'Oficinas & Reparações',
      color: 'from-blue-500/10 to-blue-500/5',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <span className="text-sm text-blue-400">Especialistas no Seu Sector</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Soluções para</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Todos os Negócios
            </span>
          </h2>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <div
              key={index}
              className={`industry-card group relative bg-gradient-to-br ${industry.color} border-2 ${industry.border} rounded-2xl p-8 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer`}
            >
              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-4 ${industry.iconBg} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {industry.icon}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {industry.name}
                </h3>
              </div>

              {/* Corner decoration */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-lg mb-6">
            Não vê o seu sector? Também trabalhamos com restaurantes, hotéis, escolas e muito mais.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-blue-600 text-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-600/10 transition-all duration-300 hover:scale-105"
          >
            Falar com Especialista
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
