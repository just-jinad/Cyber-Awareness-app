import React from 'react';
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-cyan-400" />
              <span className="text-white text-xl font-bold">Cyberix</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Leading cybersecurity solutions provider protecting businesses from digital threats with advanced security technologies and expert monitoring services.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">info@cyberix.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">123 Security Blvd, Tech City, TC 12345</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Services</h3>
            <ul className="space-y-3">
              {[
                'Network Security',
                'Data Protection',
                'Threat Detection',
                'Security Monitoring',
                'Incident Response',
                'Compliance Audit',
                'Penetration Testing',
                'Security Training'
              ].map((service, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center space-x-2 group">
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{service}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Company</h3>
            <ul className="space-y-3">
              {[
                'About Us',
                'Our Team',
                'Careers',
                'Press & Media',
                'Case Studies',
                'Blog',
                'Partners',
                'Contact'
              ].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center space-x-2 group">
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Stay Updated</h3>
            <p className="text-gray-300">
              Subscribe to our newsletter for the latest cybersecurity news and updates.
            </p>
            <div className="space-y-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-r-lg transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">Follow Us</h4>
              <div className="flex space-x-4">
                {[
                  { Icon: Facebook, href: '#' },
                  { Icon: Twitter, href: '#' },
                  { Icon: Linkedin, href: '#' },
                  { Icon: Instagram, href: '#' }
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="w-10 h-10 bg-slate-800 hover:bg-cyan-500 border border-slate-700 hover:border-cyan-400 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  >
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Certifications */}
      <div className="border-t border-slate-800 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="text-white font-medium mb-2">Security Certifications</h4>
              <div className="flex items-center space-x-6">
                <div className="text-gray-300 text-sm">ISO 27001</div>
                <div className="text-gray-300 text-sm">SOC 2 Type II</div>
                <div className="text-gray-300 text-sm">GDPR Compliant</div>
                <div className="text-gray-300 text-sm">HIPAA Compliant</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-green-400" />
              <div className="text-sm">
                <div className="text-white font-medium">99.9% Uptime</div>
                <div className="text-gray-400">Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Cyberix. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Cookie Policy</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
    </footer>
  );
};

export default Footer;