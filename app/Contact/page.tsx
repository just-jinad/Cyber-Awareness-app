import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
        <div className="absolute top-32 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-64 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <svg className="absolute top-20 right-10 w-32 h-32 text-cyan-400/20" viewBox="0 0 100 100">
          <path d="M20,20 L80,80 M80,20 L20,80" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
        <svg className="absolute bottom-20 left-10 w-24 h-24 text-blue-400/20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Get in Touch with <span className="text-cyan-400">CyberAware</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Have questions about our Cybersecurity Awareness Platform? Reach out to us for support, inquiries, or feedback. We’re here to help you stay safe online.
          </p>
        </div>
      </div>

      {/* Contact Information & Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Contact <span className="text-cyan-400">Details</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Connect with the CyberAware team at SQI College of ICT, Ogbomoso, for assistance or to learn more about our platform.
            </p>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Email Us</div>
                  <a href="mailto:info@cyberaware.sqiict.edu.ng" className="text-gray-300 hover:text-cyan-400 transition-colors">
                    info@cyberaware.sqiict.edu.ng
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Call Us</div>
                  <a href="tel:+2348034567890" className="text-gray-300 hover:text-cyan-400 transition-colors">
                    +234 (803) 456-7890
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Visit Us</div>
                  <p className="text-gray-300">SQI College of ICT, Ogbomoso, Oyo State, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 backdrop-blur-none rounded-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold mb-6">
              Send Us a <span className="text-cyan-400">Message</span>
            </h2>
            <p className="text-gray-300 mb-8">
              Fill out the form below, and our team will get back to you as soon as possible.
            </p>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  placeholder="Your message"
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                ></textarea>
              </div>
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                <span>Send Message</span>
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-slate-800/50 backdrop-blur-none rounded-2xl p-12 border border-slate-700/50 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your <span className="text-cyan-400">Cybersecurity Journey</span>?
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
            Explore our platform’s interactive modules and simulations to enhance your cybersecurity skills today.
          </p>
          <Link href="/start-learning">
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300">
              Start Learning Now
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}