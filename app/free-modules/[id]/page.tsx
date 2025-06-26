import Link from "next/link";
import { freeModules } from "@/lib/free-modules";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Define props type for Next.js App Router
interface FreeModulePageProps {
  params: Promise<{ id: string }>; // params is a Promise
}

export async function generateStaticParams() {
  return freeModules.map((module) => ({ id: module.id }));
}

export default async function FreeModulePage({ params }: FreeModulePageProps) {
  const { id } = await params; // Await params to get id
  const module = freeModules.find((m) => m.id === id);
  if (!module) notFound();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          {module.title}
        </h1>
        {module.imageUrl && (
          <img
            src={module.imageUrl}
            alt={module.title}
            className="w-full h-48 object-cover rounded-lg mb-6"
          />
        )}
        <div className="prose prose-invert text-gray-200 mb-8">
          <p>{module.content}</p>
        </div>
        <div className="text-center">
          <p className="text-lg text-gray-200 mb-4">
            Want to learn more advanced cybersecurity skills?
          </p>
          <Link href="/auth/signup">
            <button className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300">
              Sign Up to Access More Modules
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
