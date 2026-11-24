import React from "react";
import { DownloadFolio } from "@/components/DownloadFolio";
import { Footer } from "@/components/Footer";
import { HeroEnlarger } from "@/components/HeroEnlarger";
import { Navigation } from "@/components/Navigation";
import { OpticalPipeline } from "@/components/OpticalPipeline";
import { PolarityShell } from "@/components/PolarityShell";
import { StockGallery } from "@/components/StockGallery";
import { WorkflowStage } from "@/components/WorkflowStage";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#141518] text-[#f2f2f0]">
      <Navigation />
      <main>
        <PolarityShell>
          <HeroEnlarger />
          <OpticalPipeline />
          <StockGallery />
          <WorkflowStage />
          <DownloadFolio />
        </PolarityShell>
      </main>
      <Footer />
    </div>
  );
}
