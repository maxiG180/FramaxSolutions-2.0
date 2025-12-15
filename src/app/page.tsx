import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { NewPortfolio } from "@/components/sections/NewPortfolio";
import { Process } from "@/components/sections/Process";
import { TechStack } from "@/components/sections/TechStack";
import { Booking } from "@/components/sections/Booking";
import { DiscountOffer } from "@/components/ui/DiscountOffer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <Features />
      <NewPortfolio />
      <Process />
      <Booking />
      <TechStack />
      <DiscountOffer />
    </main>
  );
}
