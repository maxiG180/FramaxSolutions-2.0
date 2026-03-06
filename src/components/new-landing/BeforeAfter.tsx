'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { X, Check, Phone, Calendar, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BeforeAfter() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.comparison-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <span className="text-sm text-blue-400">A Diferença é Real</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Sem Framax</span>
            <span className="text-gray-500 mx-4">vs</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Com Framax
            </span>
          </h2>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* BEFORE - Without Framax */}
          <div className="comparison-card relative">
            {/* Header */}
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-t-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Sem Framax</h3>
              </div>
              <p className="text-red-400 text-sm">O negócio a lutar para crescer</p>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/30 border-t-0 rounded-b-2xl p-6 space-y-6">

              {/* Phone Scenario */}
              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <Phone className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">Chamadas Perdidas</div>
                    <div className="text-xs text-gray-400">Telefone sempre a tocar, sem conseguir atender</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  <span className="font-mono">-40% de oportunidades perdidas</span>
                </div>
              </div>

              {/* Calendar Scenario */}
              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">Agenda no Papel</div>
                    <div className="text-xs text-gray-400">Marcações confusas, clientes esquecem-se</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {['No-show: 35%', 'Confirmar por telefone', 'Sem lembretes'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-red-400">
                      <X className="w-3 h-3" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Wasted */}
              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">Tempo Desperdiçado</div>
                    <div className="text-xs text-gray-400">15h/semana em tarefas administrativas</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-red-500/10 rounded text-center">
                  <div className="text-2xl font-bold text-red-400">60h/mês</div>
                  <div className="text-xs text-gray-400">que poderia usar para crescer</div>
                </div>
              </div>

              {/* Google Invisible */}
              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                <div className="text-sm font-semibold text-white mb-2">No Google:</div>
                <div className="space-y-1.5">
                  <div className="text-xs text-gray-500 line-through">Concorrente A</div>
                  <div className="text-xs text-gray-500 line-through">Concorrente B</div>
                  <div className="text-xs text-gray-500 line-through">Concorrente C</div>
                  <div className="flex items-center gap-2 text-xs text-red-400 mt-2">
                    <span className="font-mono">Página 3+</span>
                    <span className="text-gray-600">← O seu negócio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AFTER - With Framax */}
          <div className="comparison-card relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Com Framax</h3>
              </div>
              <p className="text-blue-100 text-sm">Negócio otimizado e em crescimento</p>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-br from-blue-950/50 to-black border-2 border-blue-500/30 border-t-0 rounded-b-2xl p-6 space-y-6">

              {/* Automated Booking */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <Phone className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">Marcações 24/7 Automáticas</div>
                    <div className="text-xs text-gray-400">Clientes marcam online a qualquer hora</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-mono">+3x mais marcações</span>
                </div>
              </div>

              {/* Smart Calendar */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">Agenda Inteligente</div>
                    <div className="text-xs text-gray-400">Lembretes automáticos, confirmações por SMS</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {['No-show: 5%', 'Lembretes automáticos', 'Confirmações SMS/Email'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-green-400">
                      <Check className="w-3 h-3" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Saved */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">Tempo Libertado</div>
                    <div className="text-xs text-gray-400">Automação poupa 10h/semana</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-500/10 rounded text-center">
                  <div className="text-2xl font-bold text-blue-400">40h/mês</div>
                  <div className="text-xs text-gray-400">para focar em crescimento</div>
                </div>
              </div>

              {/* Google #1 */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="text-sm font-semibold text-white mb-2">No Google:</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 bg-blue-500/20 rounded border border-blue-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-blue-400">O SEU NEGÓCIO</span>
                    <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">#1</span>
                  </div>
                  <div className="text-xs text-gray-500 line-through">Concorrente A</div>
                  <div className="text-xs text-gray-500 line-through">Concorrente B</div>
                  <div className="flex items-center gap-2 text-xs text-green-400 mt-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>+250% visibilidade online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-lg mb-6">
            Pronto para transformar o seu negócio?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
          >
            Começar Agora
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
