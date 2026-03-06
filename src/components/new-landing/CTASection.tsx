'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CTASection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission (replace with actual API call)
    try {
      // TODO: Implement actual form submission to your backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', business: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black"
    >
      <div className="max-w-5xl mx-auto cta-content">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-sm text-blue-400">
              {t.newLanding?.cta?.badge || 'Vamos Conversar'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">
              {t.newLanding?.cta?.title || 'Pronto Para Crescer'}
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              {t.newLanding?.cta?.subtitle || 'O Seu Negócio Online?'}
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t.newLanding?.cta?.description ||
              'Marque uma consulta gratuita e descubra como podemos ajudar o seu negócio a destacar-se online.'}
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  {t.newLanding?.cta?.nameLabel || 'Nome Completo'}
                  <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors duration-200"
                  placeholder={t.newLanding?.cta?.namePlaceholder || 'João Silva'}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  {t.newLanding?.cta?.emailLabel || 'Email'}
                  <span className="text-blue-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors duration-200"
                  placeholder={t.newLanding?.cta?.emailPlaceholder || 'joao@exemplo.pt'}
                />
              </div>
            </div>

            {/* Phone and Business type row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  {t.newLanding?.cta?.phoneLabel || 'Telefone'}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors duration-200"
                  placeholder={t.newLanding?.cta?.phonePlaceholder || '+351 912 345 678'}
                />
              </div>

              <div>
                <label htmlFor="business" className="block text-sm font-medium text-gray-300 mb-2">
                  {t.newLanding?.cta?.businessLabel || 'Tipo de Negócio'}
                </label>
                <select
                  id="business"
                  name="business"
                  value={formData.business}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-600 transition-colors duration-200"
                >
                  <option value="">
                    {t.newLanding?.cta?.businessPlaceholder || 'Selecione...'}
                  </option>
                  <option value="salon">
                    {t.newLanding?.cta?.businessSalon || 'Salão / Barbearia'}
                  </option>
                  <option value="gym">
                    {t.newLanding?.cta?.businessGym || 'Ginásio / Studio'}
                  </option>
                  <option value="clinic">
                    {t.newLanding?.cta?.businessClinic || 'Clínica / Consultório'}
                  </option>
                  <option value="workshop">
                    {t.newLanding?.cta?.businessWorkshop || 'Oficina / Reparações'}
                  </option>
                  <option value="other">
                    {t.newLanding?.cta?.businessOther || 'Outro'}
                  </option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                {t.newLanding?.cta?.messageLabel || 'Mensagem'}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors duration-200 resize-none"
                placeholder={
                  t.newLanding?.cta?.messagePlaceholder ||
                  'Conte-nos sobre o seu negócio e como podemos ajudar...'
                }
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting
                ? t.newLanding?.cta?.submitting || 'A Enviar...'
                : t.newLanding?.cta?.submit || 'Marcar Consulta Gratuita'}
            </button>

            {/* Status messages */}
            {submitStatus === 'success' && (
              <div className="p-4 bg-green-600/10 border border-green-600/50 rounded-lg text-green-400 text-center">
                {t.newLanding?.cta?.successMessage ||
                  '✓ Mensagem enviada! Entraremos em contacto em breve.'}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 bg-red-600/10 border border-red-600/50 rounded-lg text-red-400 text-center">
                {t.newLanding?.cta?.errorMessage ||
                  '✗ Erro ao enviar mensagem. Por favor, tente novamente.'}
              </div>
            )}
          </form>

          {/* Contact info */}
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 mb-4">
              {t.newLanding?.cta?.orContact || 'Ou contacte-nos diretamente:'}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="mailto:info@framax.pt"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                info@framax.pt
              </a>
              <a
                href="tel:+351912345678"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                +351 912 345 678
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
