"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { HeroSlide } from "@/prisma/generated/prisma";

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeSlides = slides.filter((slide) => slide.isActive);

  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = () => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying || activeSlides.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, activeSlides.length]);

  // Empty state - no slides
  if (activeSlides.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-linear-to-b from-blue-50 via-white to-gray-50 border-b border-blue-100">
        <div className="relative h-[450px] md:h-[550px] lg:h-[650px]">
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 px-4">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <ImageOff className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Hero Slides Available
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Hero carousel is currently empty. Check back soon for featured content!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-linear-to-b from-blue-50 via-white to-gray-50 border-b border-blue-100">
      <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="h-full">
              {slide.slideType === "IMAGE_ONLY" ? (
                // Full-width image slide with proper aspect ratio
                <>
                  {/* Desktop Image */}
                  <div className="hidden md:block relative w-full h-full">
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt || "Hero banner"}
                      fill
                      className="object-cover object-center"
                      sizes="100vw"
                      priority={index === 0}
                    />
                  </div>
                  {/* Mobile Image */}
                  <div className="md:hidden relative w-full h-full">
                    <Image
                      src={slide.mobileImage || slide.image}
                      alt={slide.imageAlt || "Hero banner"}
                      fill
                      className="object-cover object-center"
                      sizes="100vw"
                      priority={index === 0}
                    />
                  </div>
                </>
              ) : (
                // Image with content slide - responsive layout
                <>
                  {/* Mobile: Background image with content overlay */}
                  <div className="lg:hidden relative w-full h-full">
                    <Image
                      src={slide.mobileImage || slide.image}
                      alt={slide.imageAlt || "Hero banner"}
                      fill
                      className="object-cover object-center"
                      sizes="100vw"
                      priority={index === 0}
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-transparent" />

                    {/* Content on top */}
                    <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-16">
                      <div className="space-y-3 text-center">
                        {slide.title && (
                          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight capitalize drop-shadow-lg">
                            {slide.title}
                          </h2>
                        )}
                        {slide.subtitle && (
                          <h3 className="text-xl sm:text-2xl font-medium text-white/90 capitalize drop-shadow-md">
                            {slide.subtitle}
                          </h3>
                        )}
                        {slide.buttonText && slide.buttonLink && (
                          <div className="pt-4">
                            <Button
                              asChild
                              size="lg"
                              className="bg-white text-gray-900 hover:bg-gray-100 px-8 h-12 text-base font-semibold shadow-xl"
                            >
                              <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Side by side layout */}
                  <div className="hidden lg:block container mx-auto px-6 h-full">
                    <div className="grid grid-cols-2 gap-12 items-center h-full py-12">
                      {/* Content */}
                      <div className="space-y-8 text-left">
                        <div className="space-y-3">
                          {slide.title && (
                            <h2 className="text-5xl font-semibold text-gray-900 leading-tight capitalize">
                              {slide.title}
                            </h2>
                          )}
                          {slide.subtitle && (
                            <h3 className="text-3xl font-medium text-gray-600 capitalize">
                              {slide.subtitle}
                            </h3>
                          )}
                        </div>

                        {slide.description && (
                          <p className="text-lg text-gray-600 leading-relaxed">
                            {slide.description}
                          </p>
                        )}

                        {slide.buttonText && slide.buttonLink && (
                          <div>
                            <Button
                              asChild
                              size="lg"
                              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Image */}
                      <div className="relative w-full h-[450px]">
                        <Image
                          src={slide.image}
                          alt={slide.imageAlt || slide.title || "Hero image"}
                          fill
                          className="object-contain"
                          sizes="50vw"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Navigation Arrows - Only show if more than 1 slide */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-cyan-50 p-1.5 sm:p-2.5 rounded-full border border-gray-200 hover:border-cyan-400 transition-all shadow-md backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-cyan-50 p-1.5 sm:p-2.5 rounded-full border border-gray-200 hover:border-cyan-400 transition-all shadow-md backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {activeSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-6 sm:w-8 bg-cyan-600"
                      : "w-1.5 bg-gray-300 hover:bg-cyan-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
