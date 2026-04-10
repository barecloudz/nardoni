'use client'

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Shield, Phone } from "lucide-react";

const serviceConfig: Record<string, { headline: string; sub: string; trust: string }> = {
  seo: {
    headline: "Let's get you on page 1 of Google",
    sub: "Pick a time that works for you. We'll show you exactly how we can rank your business #1 locally.",
    trust: "$500/month. First page of Google in 90 days or we keep working for free. No long-term contracts.",
  },
  websites: {
    headline: "Let's build your website",
    sub: "Pick a time that works for you. We'll map out exactly what your business needs to turn visitors into customers.",
    trust: "Professional websites built to convert. No long-term contracts.",
  },
  "ai-support": {
    headline: "Let's set up your AI customer support",
    sub: "Pick a time. We'll show you how to handle every customer inquiry 24/7 — automatically.",
    trust: "Never miss a customer inquiry again. No long-term contracts.",
  },
  "ai-phone": {
    headline: "Let's set up your AI phone agent",
    sub: "Pick a time. We'll show you how to answer every call, take orders, and book appointments automatically.",
    trust: "Never miss a call again. No long-term contracts.",
  },
  ads: {
    headline: "Let's launch your ad campaign",
    sub: "Pick a time. We'll show you exactly how to get in front of customers on Google and Meta — starting this week.",
    trust: "Ads that actually drive revenue. No long-term contracts.",
  },
  social: {
    headline: "Let's grow your social media",
    sub: "Pick a time. We'll map out a content strategy built specifically for your business.",
    trust: "Custom content across Instagram, Facebook, and TikTok. No long-term contracts.",
  },
}

const defaultConfig = {
  headline: "Let's make your business more money",
  sub: "Pick a time that works for you. We'll show you exactly how we can help your business get more customers.",
  trust: "No obligation, no pressure. Just a real conversation about your business.",
}

const BookACall = () => {
  const searchParams = useSearchParams();
  const service = searchParams.get("service") || "";
  const config = serviceConfig[service] || defaultConfig;

  useEffect(() => {
    window.scrollTo(0, 0);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
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
      <main className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

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
              {config.headline}
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              {config.sub}
            </p>

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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm">
              {config.trust}
            </p>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default BookACall;
