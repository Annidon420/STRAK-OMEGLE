"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Peer from "simple-peer";
import {
  Send,
  SkipForward,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  Crown,
  Users,
  Radar,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Flag,
  PhoneOff,
} from "lucide-react";

import { socket } from "@/socket/socket";
import { useAuthStore } from "@/store/authStore";

type MatchPreference = "any" | "male" | "female" | "other";

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [status, setStatus] = useState("Ready to start");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preference, setPreference] = useState<MatchPreference>("any");
  const [isSearching, setIsSearching] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate behavior");
  const [stranger, setStranger] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const myVideo = useRef<HTMLVideoElement>(null);
  const strangerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* AUTH CHECK */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((currentStream) => {
        setStream(currentStream);

        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch(() => {
        setStatus("Camera/Mic unavailable");
      });
  }, []);

  useEffect(() => {
    socket.connect();

    socket.off("waiting-for-match");
    socket.off("match-found");
    socket.off("receive-message");
    socket.off("webrtc-signal");
    socket.off("partner-ended-chat");
    socket.off("report-success");
    socket.off("online-users");
    socket.off("user-banned");
    socket.off("matching-error");

    socket.on("online-users", (count) => {
      setOnlineUsers(count || 0);
    });

    socket.on("waiting-for-match", () => {
      setStatus("Searching for a partner...");
      setIsSearching(true);
    });

    socket.on("match-found", (data) => {
      setStatus("Connected with stranger");
      setIsSearching(false);
      setRoomId(data.roomId);

      const otherUser = data.users?.find(
        (item: any) => item.socketId !== socket.id
      );

      setStranger(otherUser || null);

      if (!peerRef.current) {
        createPeer(data.initiator === socket.id, data.roomId);
      }
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          text: data.message,
          sender: data.sender,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });

    socket.on("webrtc-signal", (data) => {
      try {
        if (peerRef.current && data.sender !== socket.id) {
          peerRef.current.signal(data.signal);
        }
      } catch {
        console.log("Ignored duplicate WebRTC signal");
      }
    });

    socket.on("partner-ended-chat", () => {
      cleanupConnection();
      setStatus("Partner ended the chat");
      setMessages([]);
    });

    socket.on("report-success", (data) => {
      setReportLoading(false);
      setShowReportBox(false);
      setStatus(data?.message || "Report submitted");
    });

    socket.on("user-banned", (data) => {
      cleanupConnection();

      setStatus(data?.reason || "You are banned from live chat");

      alert(
        `${data?.message || "You are banned from using live chat."}\nReason: ${
          data?.reason || "Banned by admin"
        }`
      );
    });

    socket.on("matching-error", (data) => {
      cleanupConnection();

      setStatus(data?.message || "Matching error");

      alert(data?.message || "Something went wrong while matching.");
    });

    return () => {
      socket.off("waiting-for-match");
      socket.off("match-found");
      socket.off("receive-message");
      socket.off("webrtc-signal");
      socket.off("partner-ended-chat");
      socket.off("report-success");
      socket.off("online-users");
      socket.off("user-banned");
      socket.off("matching-error");
    };
  }, [stream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const createPeer = (initiator: boolean, room: string) => {
    if (!stream) return;

    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("webrtc-signal", {
        roomId: room,
        signal,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (strangerVideo.current) {
        strangerVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", () => {
      console.log("Peer error ignored");
    });

    peerRef.current = peer;
  };

  const cleanupConnection = () => {
    setRoomId("");
    setIsSearching(false);
    setStranger(null);
    setShowReportBox(false);
    setReportLoading(false);

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (strangerVideo.current) {
      strangerVideo.current.srcObject = null;
    }
  };

  const joinQueue = () => {
    const storedUser =
      typeof window !== "undefined"
        ? localStorage.getItem("user")
        : null;

    const parsedUser = storedUser
      ? JSON.parse(storedUser)
      : user;

    socket.emit("join-queue", {
      userId: parsedUser?._id,
      username: parsedUser?.username || "User",
      gender: parsedUser?.gender || "other",
      premium: parsedUser?.premium || false,
      preference,
    });
  };

  const startMatching = () => {
    setMessages([]);
    setStatus("Searching for a partner...");
    cleanupConnection();
    setIsSearching(true);
    joinQueue();
  };

  const nextUser = () => {
    setMessages([]);
    setStatus("Finding next partner...");
    cleanupConnection();
    setIsSearching(true);

    socket.emit("next-user");

    setTimeout(() => {
      joinQueue();
    }, 300);
  };

  const endChat = () => {
    if (roomId) {
      socket.emit("end-chat", {
        roomId,
      });
    }

    cleanupConnection();
    setMessages([]);
    setStatus("Chat ended");
  };

  const toggleMic = () => {
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  const toggleCamera = () => {
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    });
  };

  const openReportBox = () => {
    if (!roomId) {
      alert("Please connect with a stranger first, then you can report.");
      setStatus("Connect with a user first");
      return;
    }

    setShowReportBox(true);
  };

  const submitReport = () => {
    if (!roomId) {
      alert("No active room found.");
      return;
    }

    setReportLoading(true);

    socket.emit("report-user", {
      roomId,
      reason: reportReason,

      reporterUserId: user?._id || null,
      reporterUsername: user?.username || "Unknown User",

      reportedUserId: stranger?.userId || null,
      reportedUsername: stranger?.username || "Stranger",
      reportedSocket: stranger?.socketId || "",
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !roomId) return;

    socket.emit("send-message", {
      roomId,
      message,
    });

    setMessage("");
  };

  const handleEnterSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-[#070714] text-white overflow-hidden relative">
      <div className="absolute top-[-180px] left-[-180px] w-[520px] h-[520px] bg-violet-600/25 blur-[170px] rounded-full" />
      <div className="absolute bottom-[-180px] right-[-180px] w-[520px] h-[520px] bg-fuchsia-600/25 blur-[170px] rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:70px_70px]" />

      <section className="relative z-10 p-5 md:p-7 max-w-[1500px] mx-auto">
        <nav className="h-20 rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl px-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                STRAK Live
              </h1>

              <p className="text-xs text-gray-400">
                Random video chat room
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 transition"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 transition"
            >
              Profile
            </button>

            <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {status}
            </div>

            <div className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm flex items-center gap-2">
              <Users size={16} />
              {onlineUsers.toLocaleString()} Online
            </div>

            <div className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm flex items-center gap-2">
              <ShieldCheck size={16} />
              Safe Mode
            </div>
          </div>
        </nav>

        <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-6 mt-6">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-[620px] rounded-[40px] overflow-hidden bg-black border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.12)]"
            >
              <video
                ref={strangerVideo}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {!roomId && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "linear",
                    }}
                    className="w-32 h-32 rounded-full border border-violet-500/20 border-t-violet-400 flex items-center justify-center mb-7"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.6)]">
                      <Radar size={34} />
                    </div>
                  </motion.div>

                  <motion.h2
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                    }}
                    className="text-4xl font-black text-center"
                  >
                    {isSearching ? "Searching Partner..." : "No Partner Yet"}
                  </motion.h2>

                  <p className="text-gray-400 mt-4 max-w-md text-center">
                    {isSearching
                      ? `Looking for ${
                          preference === "any" ? "anyone" : preference
                        } users. Please wait...`
                      : "Choose a preference and start matching."}
                  </p>

                  {isSearching && (
                    <div className="flex gap-2 mt-7">
                      <span className="w-3 h-3 rounded-full bg-violet-400 animate-bounce" />
                      <span className="w-3 h-3 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-3 h-3 rounded-full bg-pink-400 animate-bounce [animation-delay:0.3s]" />
                    </div>
                  )}
                </div>
              )}

              <div className="absolute top-5 left-5 px-5 py-2 rounded-full bg-black/45 border border-white/10 backdrop-blur-xl text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {stranger?.username || "Stranger"}
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                <div className="px-5 py-3 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-xl">
                  <p className="text-sm text-gray-400">
                    Connection
                  </p>

                  <p className="font-bold text-green-300">
                    {roomId
                      ? "Live session"
                      : isSearching
                      ? "Searching"
                      : "Waiting"}
                  </p>
                </div>

                <div className="hidden md:flex gap-3">
                  <button
                    onClick={startMatching}
                    className="px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold hover:scale-105 transition shadow-[0_0_30px_rgba(139,92,246,0.35)]"
                  >
                    Start Matching
                  </button>

                  <button
                    onClick={nextUser}
                    className="px-6 py-4 rounded-2xl bg-white/10 border border-white/10 font-bold hover:bg-white/20 transition flex items-center gap-2"
                  >
                    <SkipForward size={18} />
                    Next
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="relative h-[230px] rounded-[32px] overflow-hidden bg-black border border-white/10">
                <video
                  ref={myVideo}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {!cameraOn && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <CameraOff size={42} className="text-gray-400" />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 px-4 py-2 rounded-full bg-black/45 border border-white/10 backdrop-blur-xl text-sm">
                  You
                </div>
              </div>

              <div className="md:col-span-2 rounded-[32px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-6">
                <div className="flex items-center gap-3">
                  <Crown className="text-violet-300" />
                  <h3 className="text-xl font-bold">
                    Match Preference
                  </h3>
                </div>

                <p className="text-gray-400 leading-relaxed mt-3">
                  Select who you want to interact with. Later this can become a premium feature.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  {[
                    { label: "Anyone", value: "any" },
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Other", value: "other" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() =>
                        setPreference(item.value as MatchPreference)
                      }
                      className={`py-3 rounded-2xl border transition font-semibold ${
                        preference === item.value
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent"
                          : "bg-white/10 border-white/10 hover:bg-white/20"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  <button
                    onClick={toggleMic}
                    className={`py-3 rounded-2xl border font-semibold flex items-center justify-center gap-2 ${
                      micOn
                        ? "bg-white/10 border-white/10"
                        : "bg-red-500/20 border-red-500/30 text-red-300"
                    }`}
                  >
                    {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                    Mic
                  </button>

                  <button
                    onClick={toggleCamera}
                    className={`py-3 rounded-2xl border font-semibold flex items-center justify-center gap-2 ${
                      cameraOn
                        ? "bg-white/10 border-white/10"
                        : "bg-red-500/20 border-red-500/30 text-red-300"
                    }`}
                  >
                    {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
                    Cam
                  </button>

                  <button
                    onClick={endChat}
                    className="py-3 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-300 font-semibold flex items-center justify-center gap-2"
                  >
                    <PhoneOff size={18} />
                    End
                  </button>

                  <button
                    onClick={openReportBox}
                    className="py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/30 transition"
                  >
                    <Flag size={18} />
                    Report
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <span className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm flex items-center gap-2">
                    <Users size={15} />
                    Preference: {preference}
                  </span>

                  <span className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                    Reporting Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-[855px] rounded-[38px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <MessageCircle className="text-violet-300" />
                    Chat
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Messages are live inside this room
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center font-black">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <MessageCircle size={44} className="mb-4 opacity-60" />

                  <p className="font-semibold text-white">
                    No messages yet
                  </p>

                  <p className="text-sm mt-2">
                    Start a match and say hello.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => {
                const isMe = msg.sender === socket.id;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-[24px] px-5 py-4 ${
                        isMe
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-br-md"
                          : "bg-white/10 border border-white/10 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {msg.text}
                      </p>

                      <p
                        className={`text-[10px] mt-2 ${
                          isMe ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {msg.time || "now"}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            <div className="p-5 border-t border-white/10 bg-black/20">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={
                    roomId
                      ? "Write a message..."
                      : "Connect first to chat..."
                  }
                  value={message}
                  onKeyDown={handleEnterSend}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-violet-500 transition"
                />

                <button
                  onClick={sendMessage}
                  className="w-[58px] rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center hover:scale-105 transition shadow-[0_0_25px_rgba(139,92,246,0.35)]"
                >
                  <Send size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
                <button
                  onClick={startMatching}
                  className="py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold"
                >
                  Start
                </button>

                <button
                  onClick={nextUser}
                  className="py-4 rounded-2xl bg-white/10 border border-white/10 font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      {showReportBox && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[32px] bg-[#11111f] border border-white/10 p-7 shadow-2xl">
            <h2 className="text-3xl font-black text-red-300">
              Report User
            </h2>

            <p className="text-gray-400 mt-3">
              This report will be sent to admin moderation.
            </p>

            <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-gray-400">
                Reporting
              </p>

              <p className="font-bold text-white">
                {stranger?.username || "Current Stranger"}
              </p>
            </div>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full mt-6 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            >
              <option>Inappropriate behavior</option>
              <option>Harassment or abuse</option>
              <option>Fake gender/profile</option>
              <option>Spam or scam</option>
              <option>Other issue</option>
            </select>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setShowReportBox(false)}
                className="py-4 rounded-2xl bg-white/10 border border-white/10 font-bold"
              >
                Cancel
              </button>

              <button
                onClick={submitReport}
                disabled={reportLoading}
                className="py-4 rounded-2xl bg-red-500 hover:bg-red-400 font-bold disabled:opacity-60"
              >
                {reportLoading ? "Sending..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}