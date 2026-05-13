"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import API from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  useEffect(() => {
    const storedUser = !user && typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

    const parsedUser = storedUser ? JSON.parse(storedUser) : user;

    if (!parsedUser) {
      router.push("/login");
    }
  }, [router, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      await API.post("/auth/promote-admin", {
        userId: user?._id,
        adminKey,
      });

      if (user) {
        const adminUser = { ...user, role: "admin" };
        localStorage.setItem("user", JSON.stringify(adminUser));
        if (token) {
          setAuth(adminUser, token);
        }
      }

      localStorage.setItem("adminAccess", "true");
      toast.success("Admin access granted");
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid admin key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6">
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-violet-600/30 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-fuchsia-600/30 blur-[140px] rounded-full" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-10 shadow-[0_0_80px_rgba(139,92,246,0.2)]">
        <h1 className="text-4xl font-black mb-4 text-center bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          Admin Access
        </h1>
        <p className="text-gray-400 mb-6 text-center">
          Enter the admin key to access the moderation dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            name="adminKey"
            placeholder="Admin access key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)]"
          >
            {loading ? "Verifying..." : "Verify Admin Key"}
          </button>
        </form>
      </div>
    </div>
  );
}
