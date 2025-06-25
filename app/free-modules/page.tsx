import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { freeModules } from '@/lib/free-modules';

export default function FreeModules() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Free Cybersecurity{' '}
            <span className="text-cyan-400">Modules</span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Explore our free modules to build your cybersecurity knowledge. Learn essential skills to stay safe online, and sign up for access to more advanced content.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {freeModules.map((module, i) => (
            <Link key={i} href={`/free-modules/${module.id}`}>
              <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-600 transition-all duration-300 group hover:transform hover:scale-105">
                {module.imageUrl && (
                  <img
                    src={module.imageUrl}
                    alt={module.title}
                    className="w-full h-32 object-cover rounded-lg mb-6"
                  />
                )}
                <h2 className="text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                  {module.title}
                </h2>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {module.description}
                </p>
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-2">
                  <span>Read More</span>
                  <span>→</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}