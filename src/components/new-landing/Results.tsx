'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  {
    valueKey: 'stat1Value',
    labelKey: 'stat1Label',
    default: { value: '50+', label: 'PMEs Atendidas' },
  },
  {
    valueKey: 'stat2Value',
    labelKey: 'stat2Label',
    default: { value: '98%', label: 'Satisfação de Clientes' },
  },
  {
    valueKey: 'stat3Value',
    labelKey: 'stat3Label',
    default: { value: '3x', label: 'Aumento Médio de Leads' },
  },
  {
    valueKey: 'stat4Value',
    labelKey: 'stat4Label',
    default: { value: '24h', label: 'Tempo de Resposta' },
  },
];

const testimonials = [
  {
    nameKey: 'testimonial1Name',
    roleKey: 'testimonial1Role',
    textKey: 'testimonial1Text',
    default: {
      name: 'Ana Silva',
      role: 'Proprietária, Salão Belle',
      text: 'Desde que implementamos o sistema de marcações online, reduzi as faltas em 60% e tenho mais tempo para me focar nos clientes.',
    },
  },
  {
    nameKey: 'testimonial2Name',
    roleKey: 'testimonial2Role',
    textKey: 'testimonial2Text',
    default: {
      name: 'Carlos Mendes',
      role: 'Gerente, FitZone Gym',
      text: 'O novo site gerou 40% mais inscrições no primeiro trimestre. A equipa da Framax percebeu exatamente o que precisávamos.',
    },
  },
  {
    nameKey: 'testimonial3Name',
    roleKey: 'testimonial3Role',
    textKey: 'testimonial3Text',
    default: {
      name: 'Dr. Pedro Costa',
      role: 'Dentista, Clínica Dentária Sorrir+',
      text: 'Os pacientes adoram poder marcar consultas online. A automação poupou-me horas de trabalho administrativo todas as semanas.',
    },
  },
];

export default function Results() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate stats
      gsap.from('.stat-item', {
        scrollTrigger: {
          trigger: '.stats-grid',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });

      // Animate testimonials
      gsap.from('.testimonial-card', {
        scrollTrigger: {
          trigger: '.testimonials-grid',
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
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
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">
              {t.newLanding?.results?.title || 'Resultados'}
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              {t.newLanding?.results?.subtitle || 'Que Falam Por Si'}
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t.newLanding?.results?.description ||
              'Ajudamos PMEs portuguesas a crescer online com soluções que realmente funcionam.'}
          </p>
        </div>

        {/* Stats grid */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const value = (t.newLanding?.results as any)?.[stat.valueKey] || stat.default.value;
            const label = (t.newLanding?.results as any)?.[stat.labelKey] || stat.default.label;

            return (
              <div
                key={index}
                className="stat-item text-center p-6 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800"
              >
                <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">
                  {value}
                </div>
                <div className="text-sm text-gray-400">{label}</div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => {
            const name = (t.newLanding?.results as any)?.[testimonial.nameKey] || testimonial.default.name;
            const role = (t.newLanding?.results as any)?.[testimonial.roleKey] || testimonial.default.role;
            const text = (t.newLanding?.results as any)?.[testimonial.textKey] || testimonial.default.text;

            return (
              <div
                key={index}
                className="testimonial-card p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-blue-600/50 transition-all duration-300"
              >
                {/* Quote icon */}
                <svg
                  className="w-10 h-10 text-blue-600/30 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                {/* Testimonial text */}
                <p className="text-gray-300 mb-6 leading-relaxed">{text}</p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{name}</div>
                    <div className="text-sm text-gray-400">{role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{t.newLanding?.results?.trust1 || 'SSL Seguro'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>{t.newLanding?.results?.trust2 || 'Suporte Dedicado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{t.newLanding?.results?.trust3 || 'Garantia de Qualidade'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
