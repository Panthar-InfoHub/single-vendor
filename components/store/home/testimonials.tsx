"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content:
      "Vyomtics provides excellent-quality robotics, IoT, and drone components. Their products are reliable, affordable, and perfect for our projects. The team's technical support is outstanding.",
    author: "Prashant Kishor Sharma",
    role: "Research Associate",
  },
  {
    id: 2,
    content:
      "Vyomtics set up a high-quality robotics and IoT lab in our institute, and the results are amazing. The equipment quality, installation speed, and professionalism are truly impressive. Our students are learning better than ever.",
    author: "Principal",
    role: "The Shriram Millennium School - Best International School in Noida",
  },
  {
    id: 3,
    content:
      "The support from Vyomtics is unmatched. They understand requirements clearly and provide the best technical guidance. Quick response, fast delivery, and very trustworthy service.",
    author: "Harsh Bhardwaj",
    role: "Startup Founder",
  },

  {
    id: 4,
    content:
      "Vyomtics stands out for its strong technical foundation and practical approach to drone and robotics development. The company focus on hands-on training, quality hardware, and industry-aligned lab setups reflects a deep understanding of real-world engineering challenges. This is the kind of execution-driven innovation Indias drone ecosystem needs.",
    author: "Natish Keshari ",
    role: "Research associate IIT Jammu",
  },
  {
    id: 5,
    content:
      "Vyomtics combines deep engineering insight with real-world drone applications. Their emphasis on precision, safety, and scalable design reflects the mindset of a mature technology organization, not just a training startup. It is encouraging to see such focused innovation emerging from Indias drone ecosystem.",
    author: "Akash Sharma ",
    role: "Research associate iit jammu",
  },

  {
    id: 6,
    content:
      "We ordered drone and IoT products in bulk from Vyomtics. The pricing was competitive, quality was top-notch, and every item was tested. Highly satisfied and looking forward to long-term collaboration.",
    author: "Skillship Edutech Pvt. Ltd.",
    role: "",
  },
  {
    id: 7,
    content:
      "Vyomtics, led by Nishant Kishor Sharma, is doing exceptional work in robotics, IoT, and drone technology. Their innovative approach and commitment to quality make them a trusted technology partner.",
    author: "Praphull Gautam",
    role: "Founder Drobonation",
  },
  {
    id: 8,
    content:
      "The training provided by Vyomtics was extremely effective. Trainers were highly skilled, and the sessions were completely practical and industry-focused. Excellent experience for our students.",
    author: "Sharda University",
    role: "Agra",
  },
];
export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) setItemsPerPage(3);
      else if (window.innerWidth >= 768) setItemsPerPage(2);
      else setItemsPerPage(1);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
    

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by institutions, startups, and researchers worldwide.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-cyan-200"
              >
                {/* Quote Icon */}
                <div className="absolute -top-3 left-6 w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="w-5 h-5 text-white" fill="white" />
                </div>

                <div className="pt-4">
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm line-clamp-6">
                    {testimonial.content}
                  </p>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                    {testimonial.role && (
                      <p className="text-xs text-cyan-600 mt-1">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-cyan-50 p-3 rounded-full shadow-lg border border-gray-200 hover:border-cyan-400 transition-all z-10 hidden md:block"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-5 w-5 text-cyan-600" />
              </button>

              <button
                onClick={goToNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-cyan-50 p-3 rounded-full shadow-lg border border-gray-200 hover:border-cyan-400 transition-all z-10 hidden md:block"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-5 w-5 text-cyan-600" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-cyan-600" : "w-2 bg-gray-300 hover:bg-cyan-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
