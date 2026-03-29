'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, Users, TrendingUp, Clock, Phone, MapPin, Star } from 'lucide-react';
import gsap from 'gsap';

export default function SMBHero() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const isAnimated = useRef(false);

  useEffect(() => {
    if (!heroRef.current || isAnimated.current) return;
    isAnimated.current = true;

    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('.visual-card', {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.6,
        ease: 'back.out(1.4)',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden bg-black"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(#2563EB 1px, transparent 1px),
              linear-gradient(90deg, #2563EB 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm text-blue-400">
                Especialistas em PMEs Portuguesas
              </span>
            </div>

            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">
                Mais Clientes.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Menos Trabalho.
              </span>
            </h1>

            <p className="hero-subtitle text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Sites profissionais + sistemas de marcação online para salões, ginásios, clínicas e oficinas.
              <span className="text-white font-semibold"> Aumente vendas em 3x</span> e poupe 10 horas/semana.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a
                href="#contact"
                className="group px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-blue-700 hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Consulta Gratuita
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              <a
                href="tel:+351912345678"
                className="px-8 py-4 bg-transparent border-2 border-blue-600 text-blue-400 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-blue-600/10 inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Ligar Agora
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span>4.9/5</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>+50 PMEs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Resposta 24h</span>
              </div>
            </div>
          </div>

          {/* Right: Visual Bento Grid */}
          <div className="relative">
            {/* Label */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold mb-2">
                O Seu Negócio Pode Ser Assim
              </div>
              <svg className="w-full h-8" viewBox="0 0 200 30" fill="none">
                <path
                  d="M 10 5 Q 10 15, 20 15 L 85 15 Q 95 15, 100 20 Q 105 15, 115 15 L 180 15 Q 190 15, 190 5"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* Card 1: Booking Calendar */}
              <div className="visual-card bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 p-5 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Marcações Online</span>
                </div>
                <div className="space-y-2">
                  {['10:00 - Maria S.', '11:30 - João P.', '14:00 - Ana M.'].map((booking, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-white/5 rounded p-2 border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-gray-300">{booking}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-2xl font-bold text-blue-400">+60%</div>
                <div className="text-xs text-gray-400">Menos Faltas</div>
              </div>

              {/* Card 2: Customer Growth */}
              <div className="visual-card bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold text-white">Novos Clientes</span>
                </div>
                <div className="flex items-end gap-1 h-20 mb-2">
                  {[40, 55, 45, 70, 65, 85, 95].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all duration-700"
                      style={{
                        height: `${height}%`,
                        transitionDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-green-400">+3x</div>
                <div className="text-xs text-gray-400">Este Mês</div>
              </div>

              {/* Card 3: Google Visibility - Tall */}
              <div className="visual-card row-span-2 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl border border-yellow-500/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">Pesquisa Google</span>
                </div>

                {/* Mock Google Search Result */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-blue-400 mb-1">O SEU NEGÓCIO</div>
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-[10px] text-gray-400">4.9 • 50+ avaliações</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">Aberto • Fecha às 20:00</div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600/20 text-blue-400 text-[10px] py-1.5 rounded font-medium">
                      Ligar
                    </button>
                    <button className="flex-1 bg-blue-600/20 text-blue-400 text-[10px] py-1.5 rounded font-medium">
                      Marcar
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded p-2 mb-2">
                  <div className="text-[10px] text-gray-500 line-through">Concorrente #2</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                  <div className="text-[10px] text-gray-500 line-through">Concorrente #3</div>
                </div>

                <div className="mt-3">
                  <div className="text-2xl font-bold text-yellow-400">#1</div>
                  <div className="text-xs text-gray-400">Na Sua Área</div>
                </div>
              </div>

              {/* Card 4: Reviews */}
              <div className="visual-card bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">4.9</span>
                </div>
                <div className="text-xs text-gray-400 mb-3 italic">
                  "Desde que temos o site, os clientes não param de chegar!"
                </div>
                <div className="text-xs text-gray-500">- Maria, Salão Belle</div>
                <div className="mt-3 text-2xl font-bold text-purple-400">98%</div>
                <div className="text-xs text-gray-400">Satisfação</div>
              </div>
            </div>

            {/* Floating glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
