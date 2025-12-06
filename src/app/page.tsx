
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { NewPortfolio } from "@/components/sections/NewPortfolio";

import { Process } from "@/components/sections/Process";
import { SocialProof } from "@/components/sections/SocialProof";
import { FAQ } from "@/components/sections/FAQ";
import { Booking } from "@/components/sections/Booking";
import { DiscountOffer } from "@/components/ui/DiscountOffer";
import { ProjectEstimator } from "@/components/ui/ProjectEstimator";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <Features />
      <NewPortfolio />

      <Process />
      {/* <SocialProof /> */}
      <Booking />
      <FAQ />
      <DiscountOffer />
      <ProjectEstimator />
    </main>
  );
}
