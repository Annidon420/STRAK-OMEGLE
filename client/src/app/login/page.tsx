"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import API from "@/lib/axios";

import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {

  const router = useRouter();

  const { setAuth } =
    useAuthStore();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/login",
        formData
      );

      setAuth(
        res.data.user,
        res.data.token
      );

      toast.success(
        "Login successful 🚀"
      );

      router.push("/chat");

    } catch (error: any) {

      toast.error(
        error.response?.data?.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6">

      {/* Glow Effects */}

      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-violet-600/30 blur-[140px] rounded-full" />

      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-fuchsia-600/30 blur-[140px] rounded-full" />

      <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-7xl relative z-10">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >

          <h1 className="text-7xl font-black leading-tight">

            Welcome
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Back
            </span>

          </h1>

          <p className="text-gray-400 text-xl mt-8 max-w-xl leading-relaxed">

            Continue your premium experience with
            realtime video matching, advanced filters,
            intelligent connections and verified users.

          </p>

          <div className="grid grid-cols-2 gap-6 mt-12">

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">

              <h2 className="text-4xl font-bold">
                24/7
              </h2>

              <p className="text-gray-400 mt-2">
                Active Matching
              </p>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">

              <h2 className="text-4xl font-bold">
                AI
              </h2>

              <p className="text-gray-400 mt-2">
                Safety Moderation
              </p>

            </div>

          </div>

        </motion.div>

        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-10 shadow-[0_0_80px_rgba(139,92,246,0.2)]"
        >

          <div className="text-center mb-8">

            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
              STRAK
            </h1>

            <p className="text-gray-400 mt-3">
              Login to continue
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)]"
            >
              {loading
                ? "Signing In..."
                : "Login"}
            </button>

          </form>

          <div className="mt-8 text-center text-gray-400">

            Don’t have an account?

            <span
              onClick={() =>
                router.push("/register")
              }
              className="ml-2 text-violet-400 cursor-pointer hover:underline"
            >
              Register
            </span>

          </div>

        </motion.div>

      </div>

    </div>
  );
}