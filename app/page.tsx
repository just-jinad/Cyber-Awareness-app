import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, Monitor, Shield, Star, Database, Eye, Zap, Users, Award, BookOpen, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlays */}
        {/* <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div> */}
        
        {/* Floating dots and lines */}
        <div className="absolute top-32 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-64 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Connection lines */}
        <svg className="absolute top-20 right-10 w-32 h-32 text-cyan-400/20" viewBox="0 0 100 100">
          <path d="M20,20 L80,80 M80,20 L20,80" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
        <svg className="absolute bottom-20 left-10 w-24 h-24 text-blue-400/20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-white">
                Empower Your{' '}
                <span className="text-cyan-400">
                  Cybersecurity Knowledge
                </span>
              </h1>
              <p className="text-lg text-white leading-relaxed max-w-lg">
                Learn to protect yourself from cyber threats with our interactive Cybersecurity Awareness Platform. Master safe online practices through engaging modules, real-world simulations, and personalized learning paths.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup"className='cursor-pointer'>
                <button className="bg-cyan-500 cursor-pointer hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                  Start Learning Now
                </button>
              </Link>
              <Link href="/About" className='cursor-pointer'>
                <button className="border  border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:bg-white/10">
                  Learn More
                </button>
              </Link>
            </div>
          </div>

          {/* Right Visual - Lock with Password */}
          <div className="relative flex justify-center">
            {/* Main lock container */}
            <div className="relative">
              {/* Large lock icon with gradient background */}
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                <Lock className="h-16 w-16 text-white" />
              </div>
              
              {/* Password dots below lock */}
              <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-600 min-w-[280px]">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-center text-gray-200 text-sm mb-4">Password Strength</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              
              {/* Floating connection elements */}
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-slate-800 border-2 border-cyan-400 rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            
            {/* Connection lines */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-30" viewBox="0 0 300 300">
                <path d="M50,150 Q150,50 250,150" stroke="#22d3ee" strokeWidth="1" fill="none" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M50,150 Q150,250 250,150" stroke="#3b82f6" strokeWidth="1" fill="none" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" repeatCount="indefinite" />
                </path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Logos Section */}
      <div className="bg-slate-800 border-y border-slate-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-200 text-sm">Trusted by Educational Institutions</p>
          </div>
          <div className="flex justify-center items-center space-x-16">
            <div className="text-gray-200 font-bold text-xl">SQI College of ICT</div>
            <div className="text-gray-200 font-bold text-xl">University of Lagos</div>
            <div className="text-gray-200 font-bold text-xl">Ogun State Polytechnic</div>
            <div className="text-gray-200 font-bold text-xl">Nigerian IT Association</div>
          </div>
        </div>
      </div>

      {/* Learning Platform Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Visual - Dashboard */}
          <div className="relative">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-600">
              {/* Header with shield */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Learning Dashboard</div>
                  <div className="text-gray-200 text-sm">Track your progress</div>
                </div>
              </div>
              
              {/* Learning metrics grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-500">
                  <BookOpen className="h-6 w-6 text-cyan-400 mb-2" />
                  <div className="text-xs text-gray-200">Modules Completed</div>
                  <div className="text-sm font-semibold text-white">12/15</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-500">
                  <Eye className="h-6 w-6 text-blue-400 mb-2" />
                  <div className="text-xs text-gray-200">Quizzes Taken</div>
                  <div className="text-sm font-semibold text-white">8/10</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-500">
                  <Award className="h-6 w-6 text-yellow-400 mb-2" />
                  <div className="text-xs text-gray-200">Certificates Earned</div>
                  <div className="text-sm font-semibold text-white">3</div>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Phishing Training</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Malware Awareness</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-yellow-400">In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Learn Cybersecurity with{' '}
                <span className="text-cyan-400">
                  Interactive Modules
                </span>
              </h2>
              <p className="text-lg text-gray-200 leading-relaxed">
                Our platform offers a unified learning experience with engaging modules, real-world simulations, and progress tracking to help you master cybersecurity skills and stay safe online.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                'Interactive Phishing Simulations',
                'Personalized Learning Paths',
                'Real-time Progress Tracking',
                'Certificates for Skill Mastery'
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>
            
            {/* <Link href="/platform">
              <button className="bg-cyan-500 cursor-pointer hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Explore the Platform
              </button>
            </Link> */}
          </div>
        </div>
      </div>

      {/* Interactive Learning Approach Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Master Cybersecurity with{' '}
            <span className="text-cyan-400">
              Hands-On Learning
            </span>
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Our platform uses interactive simulations, gamified quizzes, and real-world scenarios to make learning cybersecurity engaging and effective, helping you recognize and respond to threats like phishing and malware.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: 'Engaging Modules',
              desc: 'Learn through structured, easy-to-digest lessons on phishing, password security, malware, and more.'
            },
            {
              icon: Zap,
              title: 'Real-World Simulations',
              desc: 'Practice identifying cyber threats with realistic scenarios, such as spotting phishing emails or securing devices.'
            },
            {
              icon: Award,
              title: 'Gamified Quizzes',
              desc: 'Test your knowledge with fun, interactive quizzes that reward progress with badges and certificates.'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="relative bg-slate-800 rounded-2xl p-8 border border-slate-600 transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-slate-700 to-slate-600">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-200 leading-relaxed mb-6">
                {feature.desc}
              </p>
              {/* <Link href="/features">
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-2">
                  <span>Learn More</span>
                  <span>→</span>
                </button>
              </Link> */}
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Success Stories from{' '}
            <span className="text-cyan-400">
              Our Learners
            </span>
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Hear from students and professionals who have transformed their cybersecurity skills with our platform, empowering them to stay safe in the digital world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Aisha K., Student',
              quote: 'The phishing simulations helped me spot suspicious emails in real life. I feel confident protecting my data now!',
              icon: Users
            },
            {
              name: 'Chinedu O., IT Professional',
              quote: 'The platform’s interactive modules made learning cybersecurity fun and practical. I earned my first certificate in a week!',
              icon: Award
            },
            {
              name: 'Fatima L., Educator',
              quote: 'This platform transformed how I teach cybersecurity to my students. The gamified quizzes keep them engaged!',
              icon: TrendingUp
            }
          ].map((story, i) => (
            <div
              key={i}
              className="relative bg-slate-800 rounded-2xl p-8 border border-slate-600 transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-slate-700 to-slate-600">
                <story.icon className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-200 leading-relaxed mb-6 italic">
                "{story.quote}"
              </p>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {story.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Comprehensive{' '}
            <span className="text-cyan-400">
              Cybersecurity Education
            </span>
          </h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-cyan-400">
            For All Skill Levels
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { 
              icon: BookOpen, 
              title: 'Learning Modules', 
              desc: 'Structured lessons on password security, phishing, malware, and safe browsing practices, tailored for beginners to advanced users.',
              highlight: true
            },
            { 
              icon: Eye, 
              title: 'Threat Simulations', 
              desc: 'Practice recognizing and responding to real-world cyber threats like phishing and social engineering in a safe environment.' 
            },
            { 
              icon: Database, 
              title: 'Data Protection', 
              desc: 'Learn how to secure personal and organizational data with encryption and best practices.' 
            },
            { 
              icon: Users, 
              title: 'Progress Tracking', 
              desc: 'Monitor your learning journey with personalized dashboards and earn certificates for completed modules.' 
            },
            { 
              icon: Zap, 
              title: 'Interactive Quizzes', 
              desc: 'Test your knowledge with engaging quizzes that reinforce learning and provide instant feedback.' 
            },
            { 
              icon: Award, 
              title: 'Certification Program', 
              desc: 'Earn badges and certificates to showcase your cybersecurity skills and knowledge.' 
            }
          ].map((service, i) => (
            <div 
              key={i} 
              className={`relative bg-slate-800 rounded-2xl p-8 border transition-all duration-300 group hover:transform hover:scale-105 ${
                service.highlight 
                  ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10' 
                  : 'border-slate-600 hover:border-cyan-400/30'
              }`}
            >
              {service.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-cyan-400 text-slate-900 px-4 py-1 rounded-full text-xs font-bold">
                    FEATURED
                  </div>
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                service.highlight 
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-500' 
                  : 'bg-gradient-to-br from-slate-700 to-slate-600'
              }`}>
                <service.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-200 leading-relaxed mb-6">
                {service.desc}
              </p>
              {/* <Link href="/services">
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-2">
                  <span>Read More</span>
                  <span>→</span>
                </button>
              </Link> */}
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}