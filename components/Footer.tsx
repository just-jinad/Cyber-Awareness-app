import React from "react";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const learningResources = [
    { name: "Malware Protection", href: "/free-modules/malware-protection" },
    {
      name: "Introduction to Phishing",
      href: "/free-modules/intro-to-phishing",
    },
    {
      name: "Advanced Password Security",
      href: "/free-modules/password-security-advanced",
    },
    { name: "Safe Browsing", href: "/free-modules/safe-browsing" },
    { name: "Data Protection", href: "/free-modules/data-protection" },
    { name: "Social Engineering", href: "/free-modules/social-engineering" },
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Platform Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-cyan-400" />
              <span className="text-white text-xl font-bold">CyberAware</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              A Cybersecurity Awareness Platform, that aims at empowering
              students, educators, and organizations with interactive tools to
              combat cyber threats and promote safe online practices.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">info@cyberaware.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">+234 (803) 456-7890</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span className="text-gray-300">
                  Along Old illorin road, Ogbomoso, Oyo state
                </span>
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">
              Learning Resources
            </h3>
            <ul className="space-y-3">
              {learningResources.map((resource, i) => (
                <li key={i}>
                  <Link
                    href={resource.href}
                    className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center space-x-2 group"
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{resource.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">About</h3>
            <ul className="space-y-3">
              {[
                { name: "About the Platform", href: "/About" },
                { name: "Our Mission", href: "/About" },
                { name: "Team & Supervisors", href: "/About" },
                { name: "Contact Us", href: "/Contact" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center space-x-2 group"
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Stay Informed</h3>
            <p className="text-gray-300">
              Subscribe to our newsletter for cybersecurity tips, platform
              updates, and educational resources.
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
                By subscribing, you agree to our Privacy Policy and Terms of
                Use.
              </p>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">Connect With Us</h4>
              <div className="flex space-x-4">
                {[
                  { Icon: Facebook, href: "#" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Linkedin, href: "#" },
                  { Icon: Instagram, href: "#" },
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

      {/* Certifications & Affiliations */}
      <div className="border-t border-slate-800 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="text-center sm:text-left">
              <h4 className="text-white font-medium mb-4">
                Affiliations & Standards
              </h4>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6">
                <div className="text-gray-300 text-sm px-4 py-2 bg-slate-800/50 rounded-lg">SQI College of ICT</div>
                <div className="text-gray-300 text-sm px-4 py-2 bg-slate-800/50 rounded-lg">
                  Cybersecurity Awareness Platform
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start md:justify-end space-x-4 mt-6 md:mt-0">
              <div className="flex items-center gap-4 px-6 py-3 bg-slate-800/50 rounded-lg">
                <Shield className="h-6 w-6 text-green-400" />
                <div className="text-sm">
                  <div className="text-white font-medium">Continuous Updates</div>
                  <div className="text-gray-400">For Latest Threats</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-gray-400 text-sm">
              © 2025 CyberAware. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              {/* <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Use</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Accessibility</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Support</a> */}
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      {/* <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div> */}
      <div className="absolute bottom-10 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      <div
        className="absolute bottom-20 left-20 w-1 h-1 bg-blue-400 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </footer>
  );
};

export default Footer;
