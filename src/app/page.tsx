import React from "react";
import { DownloadFolio } from "@/components/DownloadFolio";
import { Footer } from "@/components/Footer";
import { HeroEnlarger } from "@/components/HeroEnlarger";
import { LatentBackdrop } from "@/components/LatentBackdrop";
import { Navigation } from "@/components/Navigation";
import { OpticalPipeline } from "@/components/OpticalPipeline";
import { FilmFilters } from "@/components/Print";
import { ScrollThumb } from "@/components/ScrollThumb";
import { SmoothScroll } from "@/components/SmoothScroll";
import { StockGallery } from "@/components/StockGallery";
import { WorkflowStage } from "@/components/WorkflowStage";
import { latestStableRelease } from "@/lib/release";

export default async function HomePage() {
  const release = await latestStableRelease();

  return (
    <>
      <SmoothScroll />
      <FilmFilters />
      <LatentBackdrop />
      <Navigation downloadHref={release.href} />
      <div className="relative z-10">
        <main>
          <HeroEnlarger release={release} />
          <OpticalPipeline />
          <StockGallery />
          <WorkflowStage />
          <DownloadFolio release={release} />
        </main>
        <Footer />
      </div>
      <ScrollThumb />
    </>
  );
}
