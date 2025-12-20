import Image from "next/image";

const labSetups = [
  {
    id: 1,
    title: "Drone Lab Setup",
    image: "/images/drone-lab.jpeg",
    alt: "Professional Drone Lab Setup - Complete with equipment and training materials",
  },
  {
    id: 2,
    title: "Robotics Lab Setup",
    image: "/images/robotics-lab.jpg",
    alt: "Advanced Robotics Lab Setup - Equipped with latest technology",
  },
];

export function LabSetup() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Lab Solutions
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Complete Lab Infrastructure
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Industry-standard lab setups designed to provide comprehensive hands-on learning
            experience
          </p>
        </div>

        {/* Lab Setup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {labSetups.map((lab) => (
            <div
              key={lab.id}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={lab.image}
                  alt={lab.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{lab.title}</h3>
                  <div className="w-16 h-1 bg-white/80 rounded-full" />
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-900/10 rounded-xl transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Interested in setting up a lab at your institution?</p>
          <a
            href="/bulk-order"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
