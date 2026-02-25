import dynamic from 'next/dynamic';

// Dynamically import ALL heavy client components to reduce initial bundle
const Hero = dynamic(() => import('@/components/Hero'));

// Floating widget — no loading skeleton (it's position:fixed, a skeleton would cause CLS)
const DiscountOffer = dynamic(() => import('@/components/ui/DiscountOffer').then(mod => ({ default: mod.DiscountOffer })));
const Booking = dynamic(() => import('@/components/sections/Booking').then(mod => ({ default: mod.Booking })), {
  loading: () => <div className="min-h-[400px]" />,
});
const Features = dynamic(() => import('@/components/sections/Features').then(mod => ({ default: mod.Features })), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-white/5" />,
});

const NewPortfolio = dynamic(() => import('@/components/sections/NewPortfolio').then(mod => ({ default: mod.NewPortfolio })), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-white/5" />,
});

const TechStack = dynamic(() => import('@/components/sections/TechStack').then(mod => ({ default: mod.TechStack })), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-white/5" />,
});


export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <Features />
      <NewPortfolio />

      <Booking />
      <TechStack />
      <DiscountOffer />
    </main>
  );
}
