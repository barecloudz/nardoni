import { useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { motion } from "framer-motion";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import { CheckCircle, Clock, Shield, Phone } from "lucide-react";

const BookACall = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const benefits = [
    { icon: Clock, text: "30-minute strategy session" },
    { icon: Shield, text: "No obligation, no pressure" },
    { icon: CheckCircle, text: "Custom plan for your business" },
    { icon: Phone, text: "Talk to a real person" },
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Book a Free Strategy Call | Nardoni Digital</title>
        <meta name="description" content="Schedule a free 30-minute strategy call. We'll show you exactly how to get on page 1 of Google and grow your local business." />
        <meta property="og:title" content="Book a Free Strategy Call | Nardoni Digital" />
        <meta property="og:description" content="Schedule a free 30-minute strategy call. We'll show you exactly how to get on page 1 of Google." />
        <link rel="canonical" href="https://nardonidigital.com/book-a-call" />
      </Helmet>
      <Header />

      <main className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-[#35c677]/10 border border-[#35c677]/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-[#35c677]">Free Strategy Call</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] mb-6 leading-tight">
              Let's get you on{" "}
              <span className="text-[#35c677]">page 1 of Google</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Pick a time that works for you. We'll show you exactly how we can help your business get more customers.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Icon className="h-5 w-5 text-[#35c677]" />
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Calendly Embed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/nardonidigital/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=191919&primary_color=35c677"
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          </motion.div>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm">
              90-day page 1 guarantee or your money back. No long-term contracts.
            </p>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookACall;
