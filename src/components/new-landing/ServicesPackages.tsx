'use client';

import { useEffect, useRef } from 'react';
import { Check, Zap, Rocket, Crown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const packages = [
  {
    name: 'Essencial',
    icon: <Zap className="w-6 h-6" />,
    price: 'Desde 999€',
    popular: false,
    color: 'blue',
    features: [
      'Site Profissional (5 páginas)',
      'Design Responsivo',
      'SEO Básico',
      'Formulário de Contacto',
      'Google Maps Integrado',
      'SSL Certificado',
    ],
    ideal: 'Ideal para: Oficinas, Pequenos Negócios',
  },
  {
    name: 'Negócio',
    icon: <Rocket className="w-6 h-6" />,
    price: 'Desde 1.999€',
    popular: true,
    color: 'green',
    features: [
      'Tudo do Essencial',
      'Sistema de Marcações Online',
      'Lembretes Automáticos (SMS/Email)',
      'Calendário Integrado',
      'Área de Cliente',
      'CMS para Gestão Fácil',
      'SEO Avançado',
      'Integração Redes Sociais',
    ],
    ideal: 'Ideal para: Salões, Clínicas, Ginásios',
  },
  {
    name: 'Premium',
    icon: <Crown className="w-6 h-6" />,
    price: 'A partir de 3.499€',
    popular: false,
    color: 'purple',
    features: [
      'Tudo do Negócio',
      'Pagamentos Online',
      'Sistema de Avaliações',
      'Dashboard Personalizado',
      'Automação Completa',
      'App Mobile (iOS/Android)',
      'Integrações Personalizadas',
      'Suporte Prioritário 24/7',
    ],
    ideal: 'Ideal para: Cadeias, Multi-unidades',
  },
];

export default function ServicesPackages() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.package-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getColorClasses = (color: string, isPopular: boolean) => {
    const colors = {
      blue: {
        border: 'border-blue-500/30',
        bg: 'from-blue-500/10 to-blue-500/5',
        icon: 'bg-blue-500/20 text-blue-400',
        price: 'text-blue-400',
        badge: 'bg-blue-500',
      },
      green: {
        border: 'border-green-500/30',
        bg: 'from-green-500/10 to-green-500/5',
        icon: 'bg-green-500/20 text-green-400',
        price: 'text-green-400',
        badge: 'bg-green-500',
      },
      purple: {
        border: 'border-purple-500/30',
        bg: 'from-purple-500/10 to-purple-500/5',
        icon: 'bg-purple-500/20 text-purple-400',
        price: 'text-purple-400',
        badge: 'bg-purple-500',
      },
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <span className="text-sm text-blue-400">Soluções para Cada Negócio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Pacotes que</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Transformam Negócios
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Escolha o pacote ideal para o seu negócio. Todos incluem suporte e manutenção.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg, index) => {
            const colors = getColorClasses(pkg.color, pkg.popular);

            return (
              <div
                key={index}
                className={`package-card relative bg-gradient-to-br ${colors.bg} rounded-2xl border-2 ${colors.border} p-8 ${
                  pkg.popular ? 'md:-mt-4 md:mb-4 shadow-2xl shadow-green-500/20' : ''
                }`}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${colors.badge} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg`}>
                    MAIS POPULAR
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className={`inline-flex p-3 ${colors.icon} rounded-xl mb-4`}>
                    {pkg.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className={`text-3xl font-bold ${colors.price} mb-1`}>{pkg.price}</div>
                  <div className="text-xs text-gray-500">{pkg.ideal}</div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#contact"
                  className={`block w-full text-center px-6 py-3 ${
                    pkg.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  } rounded-lg font-semibold transition-all duration-300 hover:scale-105`}
                >
                  {pkg.popular ? 'Começar Agora' : 'Saber Mais'}
                </a>
              </div>
            );
          })}
        </div>

        {/* Add-ons */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Serviços Adicionais
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Manutenção Mensal', price: '20€/mês' },
              { name: 'Alojamento Premium', price: '29€/mês' },
              { name: 'SEO Mensal', price: '299€/mês' },
              { name: 'Marketing Digital', price: 'Orçamento' },
            ].map((addon, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-sm font-semibold text-white mb-1">{addon.name}</div>
                <div className="text-xs text-blue-400">{addon.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            💡 Todos os pacotes incluem 30 dias de suporte gratuito após lançamento
          </p>
        </div>
      </div>
    </section>
  );
}
