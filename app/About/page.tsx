import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Users, BookOpen, Zap, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div> */}
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
            About <span className="text-cyan-400">CyberAware</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            CyberAware is a Cybersecurity Awareness Platform developed at SQI College of ICT, Ogbomoso, to empower individuals and organizations with the knowledge and skills to navigate the digital world safely.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="bg-slate-800/50 backdrop-blur-none rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Our Mission</div>
                  <div className="text-gray-400 text-sm">Empowering Digital Safety</div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Our mission is to bridge the cybersecurity knowledge gap by providing an engaging, accessible platform that educates users on recognizing and mitigating cyber threats like phishing, malware, and social engineering.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Developed as a final year project by Adeniyi Solomon Inioluwa at SQI College of ICT, CyberAware aims to reduce human-related vulnerabilities through interactive learning and practical simulations.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Building a Safer <span className="text-cyan-400">Digital Future</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              In today’s digital world, human error accounts for a significant portion of cyber incidents. CyberAware addresses this by offering tailored learning modules, real-world simulations, and progress tracking to foster safe online practices for students, educators, and organizations.
            </p>
            <div className="space-y-4">
              {[
                'Interactive and engaging content',
                'Personalized learning paths for all skill levels',
                'Continuous updates to address evolving threats',
                'Developed under SQI College of ICT’s guidance'
              ].map((point, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-300">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Our <span className="text-cyan-400">Team</span>
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Meet the dedicated individuals behind CyberAware, committed to advancing cybersecurity education.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Adeniyi Solomon Inioluwa',
              role: 'Project Developer',
              desc: 'A final year student at SQI College of ICT, passionate about cybersecurity and education.',
              icon: Users
            },
            {
              name: 'Mr. Ayanshina Amos',
              role: 'Project Supervisor',
              desc: 'An experienced lecturer at SQI College of ICT, guiding the development of CyberAware.',
              icon: BookOpen
            },
            {
              name: 'SQI ICT Faculty',
              role: 'Academic Support',
              desc: 'The faculty at SQI College of ICT, providing expertise and resources for the platform.',
              icon: Award
            }
          ].map((member, i) => (
            <div
              key={i}
              className="relative bg-slate-800/50 backdrop-blur-none rounded-2xl p-8 border border-slate-700/50 transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform from-slate-700 to-slate-600">
                <member.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                {member.name}
              </h3>
              <p className="text-gray-300 font-semibold mb-4">{member.role}</p>
              <p className="text-gray-300 leading-relaxed">{member.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-slate-800/50 backdrop-blur-none rounded-2xl p-12 border border-slate-700/50 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Join the <span className="text-cyan-400">CyberAware</span> Community
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
            Start your journey to becoming cybersecurity-savvy today. Explore our interactive platform and empower yourself against digital threats.
          </p>
          <Link href="/auth/signup" className='cursor-pointer'>
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