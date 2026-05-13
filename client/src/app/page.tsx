"use client";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

export default function HomePage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* Background Glow */}

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/20 blur-[140px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/20 blur-[140px] rounded-full" />

      {/* Navbar */}

      <nav className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-white/10 backdrop-blur-xl">

        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          STRAK
        </h1>

        <div className="flex gap-4">

          <button
            onClick={() =>
              router.push("/login")
            }
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Login
          </button>

          <button
            onClick={() =>
              router.push("/register")
            }
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 transition"
          >
            Register
          </button>

        </div>

      </nav>

      {/* Hero Section */}

      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-7xl md:text-8xl font-black leading-tight"
        >

          Meet New
          <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            People Instantly
          </span>

        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-2xl text-gray-400 text-lg"
        >
          STRAK is a next-generation random video chat platform
          with premium matching, selfie verification,
          gender filters, realtime interactions,
          and advanced safety systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-5 mt-10"
        >

          <button
            onClick={() =>
              router.push("/register")
            }
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-lg font-bold hover:scale-105 transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)]"
          >
            Get Started
          </button>

          <button
            onClick={() =>
              router.push("/login")
            }
            className="px-8 py-4 rounded-2xl bg-white/10 border border-white/10 text-lg font-bold hover:bg-white/20 transition-all"
          >
            Sign In
          </button>

        </motion.div>

      </section>

      {/* Feature Cards */}

      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-24 max-w-7xl mx-auto">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:translate-y-[-5px] transition-all">

          <h2 className="text-2xl font-bold mb-4">
            Premium Matching
          </h2>

          <p className="text-gray-400">
            Connect with specific genders and interests
            using intelligent realtime matchmaking.
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:translate-y-[-5px] transition-all">

          <h2 className="text-2xl font-bold mb-4">
            Selfie Verification
          </h2>

          <p className="text-gray-400">
            Reduce fake profiles using AI-based
            selfie and gender verification systems.
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:translate-y-[-5px] transition-all">

          <h2 className="text-2xl font-bold mb-4">
            Secure & Fast
          </h2>

          <p className="text-gray-400">
            High-performance encrypted communication
            powered by modern realtime infrastructure.
          </p>

        </div>

      </section>

    </div>
  );
}