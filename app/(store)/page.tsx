import { generatePageMetadata } from "@/lib/metadata";
import { HeroCarousel } from "@/components/store/home/hero-carousel";
import { ShopCategoryCards } from "@/components/store/home/shop-category-cards";
import { FeaturedProducts } from "@/components/store/home/featured-products";
import { TrustBadges } from "@/components/store/home/trust-badges";
import { Testimonials } from "@/components/store/home/testimonials";
import { FAQSection } from "@/components/store/home/faq-section";
import { Achievements } from "@/components/store/home/achievements";
import { LabSetup } from "@/components/store/home/lab-setup";
import { prisma } from "@/prisma/db";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = generatePageMetadata({
  path: "/",
});

// Home page can be statically generated and revalidated
export const revalidate = 3600; // Revalidate every hour

// Separate component for hero slides
async function HeroSection() {
  const heroSlides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return <HeroCarousel slides={heroSlides} />;
}

export default async function HomePage() {
  // Fetch published FAQs
  const faqs = await prisma.fAQ.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      question: true,
      answer: true,
    },
  });

  return (
    <>
      <Suspense
        fallback={
          <div className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50 via-white to-gray-50 border-b border-blue-100">
            <div className="relative h-[450px] md:h-[550px] lg:h-[650px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        }
      >
        <HeroSection />
      </Suspense>
      <ShopCategoryCards />
      <FeaturedProducts title="SHOP OUR BESTSELLERS" filter="bestseller" />
      <Testimonials />
      <FeaturedProducts title="NEW LAUNCH" filter="new" />
      <Achievements />
      <LabSetup />
      <TrustBadges />
      <FAQSection faqs={faqs} />
    </>
  );
}
