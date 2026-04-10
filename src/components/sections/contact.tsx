'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createContact, getCompanySettings } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Mail, Phone, MapPin, Send, Clock, Users, Award } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  
  // Fetch company settings for dynamic contact info
  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: getCompanySettings
  })

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      setIsSubmitted(true)
      reset()
      setTimeout(() => setIsSubmitted(false), 3000)
    },
    onError: (error) => {
      console.error('Error submitting contact form:', error)
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    
    try {
      await createContactMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message
      })
    } catch (error) {
      console.error('Error submitting contact form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: companySettings?.email || 'hello@barecloudz.com',
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: companySettings?.phone || '(803) 977-4285',
      description: 'Mon-Fri from 8am to 6pm'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: companySettings?.company_address || '224 Thompson St, Unit #2030, Hendersonville, NC 28792',
      description: 'Come say hello at our office'
    }
  ]

  const stats = [
    { icon: Clock, value: '< 24h', label: 'Response Time' },
    { icon: Users, value: '500+', label: 'Happy Clients' },
    { icon: Award, value: '95%', label: 'Success Rate' }
  ]

  return (
    <section id="contact" className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#191919] opacity-3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6 leading-tight">
            Let's start
            <br />
            <span className="text-[#35c677]">something great</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your marketing? Get in touch with our team of experts 
            and discover how we can help accelerate your business growth.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-[#35c677] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#191919] mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-[#191919] mb-2">
                  Send us a message
                </CardTitle>
                <p className="text-gray-600 text-lg">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="p-8">
                {isSubmitted ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-20 h-20 bg-[#35c677] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Send className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#191919] mb-3">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Input
                          {...register('name')}
                          placeholder="Your Name *"
                          className={`h-12 text-lg ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="Your Email *"
                          className={`h-12 text-lg ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        {...register('company')}
                        placeholder="Company Name"
                        className="h-12 text-lg border-gray-200"
                      />
                      <Input
                        {...register('phone')}
                        placeholder="Phone Number"
                        className="h-12 text-lg border-gray-200"
                      />
                    </div>

                    <div>
                      <Textarea
                        {...register('message')}
                        placeholder="Tell us about your project *"
                        rows={6}
                        className={`text-lg resize-none ${errors.message ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full text-lg py-4 h-auto bg-[#35c677] hover:bg-[#2ba866] shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isSubmitting || createContactMutation.isPending}
                    >
                      {isSubmitting || createContactMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h3 className="text-3xl font-bold text-[#191919] mb-8">
                Get in touch
              </h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-14 h-14 bg-[#35c677] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#191919] text-lg mb-1">
                          {info.title}
                        </h4>
                        <p className="text-[#35c677] font-semibold text-lg mb-1">
                          {info.content}
                        </p>
                        <p className="text-gray-600">
                          {info.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-[#35c677] to-[#2ba866] border-0 shadow-2xl">
                <CardContent className="p-8 text-white">
                  <h4 className="text-2xl font-bold mb-4">
                    Ready to get started?
                  </h4>
                  <p className="text-green-100 mb-6 text-lg leading-relaxed">
                    Schedule a free 30-minute consultation to discuss your marketing goals 
                    and see how we can help transform your business.
                  </p>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white text-[#35c677] border-white hover:bg-gray-50 text-lg px-6 py-3 h-auto shadow-lg"
                  >
                    Schedule Free Consultation
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact