import { ContactForm } from "@/components/store/contact/contact-form";
import { generatePageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/site.config";

export const metadata = generatePageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Vyomtics. We're here to help with Robotics, IoT, AI, and Drone solutions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
          <div className="text-center space-y-5">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight">
              Contact Us
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              We're here to help you with Robotics, IoT, AI, and Drone solutions. Reach out to us
              anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                  Get in touch
                </h2>
                <p className="text-base text-gray-600 leading-relaxed">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-8">
                {/* Phone */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Phone
                  </h3>
                  <div className="space-y-2 text-gray-900">
                    <a href={`tel:${siteConfig.contact.phone}`} className="text-base block">
                      {siteConfig.contact.phone}
                    </a>
                    <a
                      href={`tel:${siteConfig.contact.alternatePhone}`}
                      className="text-base block"
                    >
                      {siteConfig.contact.alternatePhone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Email
                  </h3>
                  <div className="space-y-2 text-gray-900">
                    <p className="text-base">sales@vyomtics.com</p>
                    <p className="text-base">nishant84300@gmail.com</p>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Visit Us
                  </h3>
                  <p className="text-base text-gray-900 leading-relaxed">
                    Vyomtics powered by N.L Enterprises
                    <br />
                    Dayalbagh, Agra
                    <br />
                    Uttar Pradesh, India
                  </p>
                </div>

                {/* Business Hours */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Business Hours
                  </h3>
                  <div className="space-y-1 text-base text-gray-900">
                    <p>Monday – Saturday: 9:00 AM - 7:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                  Send us a message
                </h3>
                <p className="text-base text-gray-600">We'll receive your message via WhatsApp.</p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              Visit Our Location
            </h2>
            <p className="text-base text-gray-600">Find us at Dayalbagh, Agra, Uttar Pradesh</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d56779.05528095596!2d77.9820268!3d27.1974484!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397479e17e526b5f%3A0x36962a67a60f081e!2sVyomtics!5e0!3m2!1sen!2sin!4v1766326290122!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
