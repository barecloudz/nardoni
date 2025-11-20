import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { createContact } from "../lib/supabase";

const BookACall = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonePrefix: "+1",
    phone: "",
    website: "",
    company: "",
    problem: "",
    urgency: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare message with all details
      const fullPhone = `${formData.phonePrefix}${formData.phone}`;
      const message = `
Website: ${formData.website || 'Not provided'}
Problem: ${formData.problem || 'Not provided'}
Urgency: ${formData.urgency || 'Not provided'}
      `.trim();

      // Save to contacts table
      const { data, error } = await createContact({
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        company: formData.company,
        message: message
      });

      if (error) {
        console.error('Error saving contact:', error);
        alert('There was an error submitting your request. Please try again.');
        return;
      }

      // Send email notification (don't wait for it to complete)
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          company: formData.company,
          message: message
        })
      }).catch(err => console.error('Email notification failed:', err));

      alert("Request Received! We'll contact you within 48 hours.");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phonePrefix: "+1",
        phone: "",
        website: "",
        company: "",
        problem: "",
        urgency: "",
      });
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-8 min-h-screen" style={{ backgroundColor: '#efebe5' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-[1200px] mx-auto px-6 md:px-16 w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Heading */}
            <div className="flex flex-col items-center text-center lg:pr-12">
              <div className="inline-block bg-white rounded-full px-4 py-2 mb-6">
                <span className="text-xs font-normal text-black">Book a call</span>
              </div>
              <h1 className="text-6xl md:text-[90px] leading-[0.85] mb-6 text-black" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500, letterSpacing: '-0.02em' }}>
                Let's<br />Make<br />Money
              </h1>
              <div className="space-y-4 text-[16px] leading-[1.5]" style={{ color: '#6b6b6b', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <p>Fill out the form below and we will contact you within 48 hours to find out if we can help you.</p>
                <p className="text-black">
                  No costs, no obligations, no annoying sales pitch. Guaranteed.
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white rounded-[28px] p-10" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    className="h-14 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-black bg-transparent px-0 placeholder:text-gray-400 text-xl pb-6 transition-all duration-300"
                    style={{ fontWeight: 500, letterSpacing: '-0.05em' }}
                  />
                </div>

                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Business Email *"
                    className="h-14 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-black bg-transparent px-0 placeholder:text-gray-400 text-xl pb-6 transition-all duration-300"
                    style={{ fontWeight: 500, letterSpacing: '-0.05em' }}
                  />
                </div>

                <div className="grid grid-cols-[70px_1fr] gap-4">
                  <Input
                    id="phonePrefix"
                    name="phonePrefix"
                    type="text"
                    value={formData.phonePrefix}
                    onChange={handleChange}
                    placeholder="+1"
                    className="h-14 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-black bg-transparent px-0 placeholder:text-gray-400 text-xl pb-6 transition-all duration-300"
                    style={{ fontWeight: 500, letterSpacing: '-0.05em' }}
                  />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number *"
                    className="h-14 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-black bg-transparent px-0 placeholder:text-gray-400 text-xl pb-6 transition-all duration-300"
                    style={{ fontWeight: 500, letterSpacing: '-0.05em' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Website *"
                    className="h-14 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-black bg-transparent px-0 placeholder:text-gray-400 text-xl pb-6 transition-all duration-300"
                    style={{ fontWeight: 500, letterSpacing: '-0.05em' }}
                  />
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company Name *"
                    className="h-14 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-black bg-transparent px-0 placeholder:text-gray-400 text-xl pb-6 transition-all duration-300"
                    style={{ fontWeight: 500, letterSpacing: '-0.05em' }}
                  />
                </div>

                <div>
                  <label htmlFor="problem" className="text-xl mb-3 block text-black font-medium" style={{ letterSpacing: '-0.05em', lineHeight: '1.5' }}>
                    What is the current problem you're experiencing?
                  </label>
                  <Textarea
                    id="problem"
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    placeholder="Describe your current challenges..."
                    className="min-h-[100px] text-xl resize-none border border-gray-300 rounded-lg focus-visible:ring-0 focus-visible:border-black bg-transparent placeholder:text-gray-400 p-3 transition-all duration-300"
                    style={{ fontWeight: 500, letterSpacing: '-0.05em' }}
                  />
                </div>

                <div className="pt-4">
                  <label className="text-xl mb-4 block text-black font-medium" style={{ letterSpacing: '-0.05em', lineHeight: '1.5' }}>
                    By when do you want to solve this problem? *
                  </label>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value="today"
                        checked={formData.urgency === "today"}
                        onChange={(e) => handleRadioChange("urgency", e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="text-lg">Today</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value="tomorrow"
                        checked={formData.urgency === "tomorrow"}
                        onChange={(e) => handleRadioChange("urgency", e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="text-lg">Tomorrow</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value="few-weeks"
                        checked={formData.urgency === "few-weeks"}
                        onChange={(e) => handleRadioChange("urgency", e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="text-lg">In a few weeks</span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white hover:bg-black/90 h-14 mt-8 rounded-full group font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                  {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default BookACall;
