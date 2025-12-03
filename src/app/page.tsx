
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Portfolio } from "@/components/sections/Portfolio";
import { Comparison } from "@/components/sections/Comparison";
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
      <Portfolio />
      <Comparison />
      <Process />
      {/* <SocialProof /> */}
      <Booking />
      <FAQ />
      <DiscountOffer />
      <ProjectEstimator />
    </main>
  );
}
