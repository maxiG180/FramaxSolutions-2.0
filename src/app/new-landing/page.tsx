import SMBHero from '@/components/new-landing/SMBHero';
import Results from '@/components/new-landing/Results';
import CTASection from '@/components/new-landing/CTASection';
import { Calendar, Bell, TrendingUp, Zap, Scissors, Dumbbell, Stethoscope, Wrench } from 'lucide-react';

export default function NewLanding() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <SMBHero />

      {/* How It Works Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Simples. Rápido.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Funciona.
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Em 3 passos, o seu negócio começa a receber mais clientes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl z-10">
                1
              </div>
              <div className="relative h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-2xl p-8">
                <div className="mb-6 bg-black/50 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white font-semibold">Agenda Online</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded p-2 text-xs text-gray-400">Segunda 14:00 - Disponível</div>
                    <div className="bg-white/5 rounded p-2 text-xs text-gray-400">Terça 10:30 - Disponível</div>
                    <div className="bg-white/5 rounded p-2 text-xs text-gray-400">Quarta 16:00 - Disponível</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Cliente Marca Online</h3>
                <p className="text-gray-400 text-sm">O seu cliente escolhe o serviço e marca directamente - sem telefonar.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl z-10">
                2
              </div>
              <div className="relative h-full bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-2xl p-8">
                <div className="mb-6 bg-black/50 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white font-semibold">Notificações</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                      <div className="text-[10px] text-green-400 font-semibold">✓ Nova Marcação</div>
                      <div className="text-[9px] text-gray-500">João Silva - Seg 14:00</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                      <div className="text-[10px] text-green-400 font-semibold">✓ Lembrete Enviado</div>
                      <div className="text-[9px] text-gray-500">SMS para cliente</div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Recebe Notificação</h3>
                <p className="text-gray-400 text-sm">Sistema envia lembretes automáticos - zero trabalho para si.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl z-10">
                3
              </div>
              <div className="relative h-full bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/20 rounded-2xl p-8">
                <div className="mb-6 bg-black/50 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white font-semibold">Crescimento</span>
                  </div>
                  <div className="flex items-end gap-1 h-16 mb-2">
                    {[30, 45, 40, 60, 55, 75, 85].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">+3x</div>
                    <div className="text-[9px] text-gray-500">mais clientes</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Negócio Cresce</h3>
                <p className="text-gray-400 text-sm">Mais marcações, menos faltas. O seu negócio cresce enquanto dorme.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all">
              Quero Começar
              <Zap className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Salons */}
            <div className="group relative bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-2 border-pink-500/20 rounded-2xl p-8 hover:scale-105 transition-all cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="p-4 bg-pink-500/20 text-pink-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Scissors className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-white">Salões & Barbearias</h3>
              </div>
            </div>

            {/* Gyms */}
            <div className="group relative bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/20 rounded-2xl p-8 hover:scale-105 transition-all cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="p-4 bg-orange-500/20 text-orange-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-white">Ginásios & Studios</h3>
              </div>
            </div>

            {/* Clinics */}
            <div className="group relative bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-2xl p-8 hover:scale-105 transition-all cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="p-4 bg-green-500/20 text-green-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-white">Clínicas & Consultórios</h3>
              </div>
            </div>

            {/* Workshops */}
            <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-2xl p-8 hover:scale-105 transition-all cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Wrench className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-white">Oficinas & Reparações</h3>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400 text-lg mb-6">
              Não vê o seu sector? Também trabalhamos com restaurantes, hotéis, escolas e muito mais.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-blue-600 text-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-600/10 transition-all hover:scale-105"
            >
              Falar com Especialista
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Results />
      <CTASection />
    </main>
  );
}
