"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { useAuthStore } from "@/store/authStore";

import { socket } from "@/socket/socket";

import { useSocketStore } from "@/store/socketStore";

export default function DashboardPage() {

  const router = useRouter();

  const {
    user,
    logout,
  } = useAuthStore();

  const {
    onlineUsers,
    setOnlineUsers,
  } = useSocketStore();

  /* AUTH CHECK */

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {

      router.push("/login");

    }

  }, [router]);

  /* SOCKET CONNECTION */

  useEffect(() => {

    socket.connect();

    socket.on(
      "online-users",
      (count) => {

        setOnlineUsers(count);

      }
    );

    return () => {

      socket.disconnect();

    };

  }, []);

  return (
    <div className="min-h-screen bg-[#05070f] text-white overflow-hidden relative">
      <div className="absolute -left-24 top-10 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[140px]" />
      <div className="absolute right-0 top-24 h-[420px] w-[420px] rounded-full bg-fuchsia-500/15 blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      <nav className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-4 px-8 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-violet-300/80 mb-2">Agent Hub</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            STRAK Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            Fast access to matching, profile controls and live user insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_25px_80px_rgba(139,92,246,0.18)] transition hover:-translate-y-0.5"
          >
            Open Chat
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Profile
          </button>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded-3xl bg-red-500/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-[1440px] px-8 pb-12 pt-8">
        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]"
        >
          <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(139,92,246,0.12)] backdrop-blur-2xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.28em] text-violet-300/80">
                  Welcome back
                </p>
                <h2 className="mt-4 text-5xl font-black text-white">
                  {user?.username}
                </h2>
                <p className="mt-4 text-lg leading-8 text-gray-300">
                  Keep your profile locked in, start a chat instantly, and review live matching insights all from one polished dashboard.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push("/chat")}
                    className="rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-[0_30px_90px_rgba(139,92,246,0.22)] transition hover:-translate-y-0.5"
                  >
                    Start Matching
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    Update Profile
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] bg-gradient-to-br from-[#21193a] via-[#13081f] to-[#0b0712] p-7 shadow-[0_45px_110px_rgba(139,92,246,0.16)] border border-white/10">
                <p className="text-sm uppercase tracking-[0.18em] text-violet-300/80">
                  Plan status
                </p>
                <p className="mt-4 text-4xl font-black text-white">
                  {user?.premium ? "Premium" : "Free"}
                </p>
                <p className="mt-3 text-gray-400">
                  {user?.premium ? "Enjoy faster matches and premium options." : "Upgrade for priority matching and richer filters."}
                </p>
                <div className="mt-7 grid gap-3">
                  <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Gender</p>
                    <p className="mt-2 text-xl font-semibold text-white capitalize">{user?.gender || "Unknown"}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Active users</p>
                    <p className="mt-2 text-xl font-semibold text-white">{onlineUsers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <p className="text-sm uppercase tracking-[0.22em] text-gray-400">Live users</p>
              <p className="mt-4 text-5xl font-black text-white">{onlineUsers}</p>
              <p className="mt-3 text-gray-400">Users actively online and ready to chat right now.</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <p className="text-sm uppercase tracking-[0.22em] text-gray-400">Match preference</p>
              <p className="mt-4 text-4xl font-black capitalize text-white">{user?.gender || "Other"}</p>
              <p className="mt-3 text-gray-400">Your registered gender is used for matching.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_30px_80px_rgba(139,92,246,0.12)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Quick Actions</h2>
                <p className="mt-2 text-gray-400">Access the features you need most.</p>
              </div>
              <div className="rounded-3xl bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                Updated now
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => router.push("/chat")}
                className="rounded-3xl border border-white/10 bg-violet-600/15 px-6 py-5 text-left text-white transition hover:bg-violet-600/25"
              >
                <p className="text-lg font-semibold">Find new match</p>
                <p className="mt-2 text-sm text-gray-400">Start a chat with one click.</p>
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-left text-white transition hover:bg-white/10"
              >
                <p className="text-lg font-semibold">Update profile</p>
                <p className="mt-2 text-sm text-gray-400">Customize your profile and preferences.</p>
              </button>
              <button
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-left text-white transition hover:bg-white/10"
              >
                <p className="text-lg font-semibold">Gender settings</p>
                <p className="mt-2 text-sm text-gray-400">Set the gender match you want to meet.</p>
              </button>
              <button
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-left text-white transition hover:bg-white/10"
              >
                <p className="text-lg font-semibold">Support center</p>
                <p className="mt-2 text-sm text-gray-400">Find help or report issues instantly.</p>
              </button>
            </div>
          </div>

          <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#1f1b2d]/90 via-[#0f0717]/90 to-[#0b0611]/90 p-8 backdrop-blur-2xl">
            <h2 className="text-2xl font-black text-white">Premium benefits</h2>
            <p className="mt-3 text-gray-400">Upgrade for better speed, filters, and experience.</p>

            <ul className="mt-6 space-y-4 text-gray-300">
              <li className="rounded-3xl bg-white/5 p-4 border border-white/10">
                <p className="font-semibold">Priority matching</p>
                <p className="text-sm text-gray-400">Get paired faster than standard users.</p>
              </li>
              <li className="rounded-3xl bg-white/5 p-4 border border-white/10">
                <p className="font-semibold">Advanced filters</p>
                <p className="text-sm text-gray-400">Control who you match with.</p>
              </li>
              <li className="rounded-3xl bg-white/5 p-4 border border-white/10">
                <p className="font-semibold">HD video rooms</p>
                <p className="text-sm text-gray-400">Experience higher-quality chats.</p>
              </li>
            </ul>
          </div>
        </motion.section>
      </main>
    </div>
  );
}