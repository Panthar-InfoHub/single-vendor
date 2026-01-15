"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, activeSlides.length]);

  // Empty state - no slides
  if (activeSlides.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-gray-50 border-b">
        <div className="relative h-[300px] md:h-[400px]">
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
    <div className="relative w-full">
      {/* Hero Carousel Container - Full width on ALL screens */}
      <div className="relative w-full">
        {activeSlides.map((slide, index) => {
          const slideContent = (
            <div className="relative w-full overflow-hidden cursor-pointer group">
              <Image
                src={slide.image}
                alt={slide.imageAlt || "Hero banner"}
                width={1920}
                height={600}
                className="w-full h-auto max-w-full"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
          );

          return (
            <div
              key={slide.id}
              className={`transition-opacity duration-700 ${index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 absolute inset-0 pointer-events-none"
                }`}
            >
              {slide.buttonLink ? (
                <Link href={slide.buttonLink} className="block w-full">
                  {slideContent}
                </Link>
              ) : (
                slideContent
              )}
            </div>
          );
        })}

        {/* Navigation Arrows - Only show if more than 1 slide */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {activeSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-gray-800" : "w-2 bg-gray-400 hover:bg-gray-600"
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
