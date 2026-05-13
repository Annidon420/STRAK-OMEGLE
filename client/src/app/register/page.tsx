"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import API from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {

  const router = useRouter();

  const { setAuth } = useAuthStore();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      password: "",
      gender: "male",
      interests: "",
      bio: "",
    });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

      const dataToSend = {
        ...formData,
        interests: formData.interests
          ? formData.interests.split(",").map(i => i.trim()).filter(i => i)
          : [],
      };

      const res = await API.post(
        "/auth/register",
        dataToSend
      );

      setAuth(
        res.data.user,
        res.data.token
      );

      toast.success(
        "Welcome to STRAK 🚀"
      );

      router.push("/chat");

    } catch (error: any) {

      toast.error(
        error.response?.data?.message ||
        "Registration failed"
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

      <div className="grid lg:grid-cols-2 w-full max-w-7xl items-center gap-12 relative z-10">

        {/* LEFT SIDE */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >

          <h1 className="text-7xl font-black leading-tight">

            Join The
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Future
            </span>

          </h1>

          <p className="text-gray-400 text-xl mt-8 max-w-xl leading-relaxed">

            Experience the next generation of random
            video interactions with premium matching,
            gender filters, selfie verification,
            realtime chat and intelligent connections.

          </p>

          <div className="flex gap-6 mt-12">

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">

              <h2 className="text-4xl font-bold">
                50K+
              </h2>

              <p className="text-gray-400 mt-2">
                Active Users
              </p>

            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">

              <h2 className="text-4xl font-bold">
                120+
              </h2>

              <p className="text-gray-400 mt-2">
                Countries
              </p>

            </div>

          </div>

        </motion.div>

        {/* RIGHT SIDE */}

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
              Create your premium account
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition"
            />

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

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition"
            >
              <option value="male">
                Male
              </option>

              <option value="female">
                Female
              </option>

              <option value="other">
                Other
              </option>

            </select>

            <input
              type="text"
              name="interests"
              placeholder="Interests (comma-separated, e.g., gaming, music)"
              value={formData.interests}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition"
            />

            <textarea
              name="bio"
              placeholder="Short bio (optional)"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)]"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <div className="mt-8 text-center text-gray-400">

            Already have an account?

            <span
              onClick={() =>
                router.push("/login")
              }
              className="ml-2 text-violet-400 cursor-pointer hover:underline"
            >
              Login
            </span>

          </div>

        </motion.div>

      </div>

    </div>
  );
}