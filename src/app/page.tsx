import dynamic from 'next/dynamic';
import Hero from "@/components/Hero";
import { Booking } from "@/components/sections/Booking";
import { DiscountOffer } from "@/components/ui/DiscountOffer";

// Dynamically import non-critical components to reduce initial bundle
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
