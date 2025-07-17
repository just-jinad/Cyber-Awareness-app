"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useState } from "react";

interface FormData {
  username: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}

export default function Signup() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Signup successful! Please sign in.");
        router.push("/auth/signin");
      } else {
        toast.error("Signup failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
        <div className="absolute top-32 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-64 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: "2s" }}></div>
        <svg className="absolute top-20 right-10 w-32 h-32 text-cyan-400/20" viewBox="0 0 100 100">
          <path d="M20,20 L80,80 M80,20 L20,80" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
        <svg className="absolute bottom-20 left-10 w-24 h-24 text-blue-400/20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* Sign Up Form */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700/20 p-8 transition-all duration-300 hover:shadow-3xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-300 to-cyan-400 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-gray-400 mt-2">Join us today and get started</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
                <div className="w-full sm:w-1/2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    {...register("username", { required: "Username is required" })}
                    id="username"
                    placeholder="Enter your username"
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-slate-600 bg-slate-900/80 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-1/2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                    })}
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 mt-2 py-3 rounded-lg border border-slate-600 bg-slate-900/80 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="w-full px-4 mt-2 py-3 rounded-lg border border-slate-600 bg-slate-900/80 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  {...register("role", { required: "Role is required" })}
                  id="role"
                  className="w-full px-4 mt-2 py-3 rounded-lg border border-slate-600 bg-slate-900/80 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200"
                >
                  <option value="USER">User</option>
                  {/* <option value="ADMIN">Admin</option> */}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.role.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <a href="/auth/signin" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}