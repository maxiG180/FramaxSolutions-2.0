'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const industries = [
  {
    icon: '💇',
    titleKey: 'salons',
    descKey: 'salonsDesc',
    features: ['salonsFeature1', 'salonsFeature2', 'salonsFeature3'],
    default: {
      title: 'Salões & Barbearias',
      desc: 'Agende cortes online, envie lembretes automáticos e mostre o seu portfólio.',
      features: ['Sistema de marcações 24/7', 'Galeria de trabalhos', 'Lembretes por SMS/Email'],
    },
  },
  {
    icon: '💪',
    titleKey: 'gyms',
    descKey: 'gymsDesc',
    features: ['gymsFeature1', 'gymsFeature2', 'gymsFeature3'],
    default: {
      title: 'Ginásios & Studios',
      desc: 'Gestão de aulas, inscrições online e acompanhamento de membros.',
      features: ['Calendário de aulas', 'Pagamentos online', 'Portal de membros'],
    },
  },
  {
    icon: '🦷',
    titleKey: 'clinics',
    descKey: 'clinicsDesc',
    features: ['clinicsFeature1', 'clinicsFeature2', 'clinicsFeature3'],
    default: {
      title: 'Clínicas & Consultórios',
      desc: 'Marcação de consultas, gestão de pacientes e comunicação automatizada.',
      features: ['Agendamento online', 'Lembretes de consultas', 'Área de pacientes'],
    },
  },
  {
    icon: '🔧',
    titleKey: 'workshops',
    descKey: 'workshopsDesc',
    features: ['workshopsFeature1', 'workshopsFeature2', 'workshopsFeature3'],
    default: {
      title: 'Oficinas & Reparações',
      desc: 'Orçamentos online, rastreamento de serviços e notificações de progresso.',
      features: ['Pedido de orçamentos', 'Rastreio de reparações', 'Notificações automáticas'],
    },
  },
];

export default function Industries() {
  const { t } = useLanguage();
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
        y: 50,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <span className="text-sm text-blue-400">
              {t.newLanding?.industries?.badge || 'Especialistas no Seu Sector'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">
              {t.newLanding?.industries?.title || 'Soluções Personalizadas'}
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              {t.newLanding?.industries?.subtitle || 'Para o Seu Sector'}
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t.newLanding?.industries?.description ||
              'Entendemos as necessidades específicas do seu negócio. Veja como podemos ajudar.'}
          </p>
        </div>

        {/* Industries grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {industries.map((industry, index) => {
            const title = (t.newLanding?.industries as any)?.[industry.titleKey] || industry.default.title;
            const desc = (t.newLanding?.industries as any)?.[industry.descKey] || industry.default.desc;
            const features = industry.features.map(
              (key, i) => (t.newLanding?.industries as any)?.[key] || industry.default.features[i]
            );

            return (
              <div
                key={index}
                className="industry-card group relative p-8 rounded-2xl bg-black border border-gray-800 hover:border-blue-600/50 transition-all duration-300 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-5xl mb-4">{industry.icon}</div>

                  {/* Title & description */}
                  <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{desc}</p>

                  {/* Features list */}
                  <ul className="space-y-3">
                    {features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            {t.newLanding?.industries?.ctaText || 'Não vê o seu sector? Contacte-nos!'}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-blue-600 text-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-600/10 transition-all duration-300 hover:scale-105"
          >
            {t.newLanding?.industries?.cta || 'Falar com Especialista'}
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
