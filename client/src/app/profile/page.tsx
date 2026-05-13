"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import API from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "male",
    interests: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        gender: user.gender || "male",
        interests: user.interests ? user.interests.join(", ") : "",
        bio: user.bio || "",
      });
    }
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        interests: formData.interests
          ? formData.interests.split(",").map((i) => i.trim()).filter((i) => i)
          : [],
      };

      const res = await API.put("/auth/profile", dataToSend);

      setAuth(res.data.user, null); // Update user without changing token

      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6">
      {/* Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-violet-600/30 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-fuchsia-600/30 blur-[140px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-10 shadow-[0_0_80px_rgba(139,92,246,0.2)] w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <p className="text-gray-400 mt-3">Update your information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-500 transition"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
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

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 rounded-2xl font-bold hover:scale-[1.02] transition-all"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-white/10 border border-white/20 p-4 rounded-2xl font-bold hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}