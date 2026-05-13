"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  Crown,
  ShieldCheck,
  Flag,
  Activity,
  ArrowLeft,
  CheckCircle,
  Trash2,
  Eye,
  Ban,
  Unlock,
} from "lucide-react";
import { useRouter } from "next/navigation";

import API from "@/lib/axios";

export default function AdminPage() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const hasAdminAccess = typeof window !== "undefined" && localStorage.getItem("adminAccess") === "true";

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    if (!hasAdminAccess) {
      router.replace("/admin/login");
      return;
    }

    setIsAuthorized(true);
    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const statsRes = await API.get("/admin/stats");
      const reportsRes = await API.get("/admin/reports");

      setStats(statsRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateReport = async (
    id: string,
    status: "reviewed" | "resolved"
  ) => {
    try {
      setLoadingAction(id + status);

      await API.patch(`/admin/reports/${id}/status`, {
        status,
      });

      await fetchAdminData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAction("");
    }
  };

  const removeReport = async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Delete this report permanently?"
      );

      if (!confirmDelete) return;

      setLoadingAction(id + "delete");

      await API.delete(`/admin/reports/${id}`);

      await fetchAdminData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAction("");
    }
  };

  const banReportedUser = async (report: any) => {
    try {
      const userId = report.reportedUserId?._id || report.reportedUserId;
      const username =
        report.reportedUserId?.username || report.reportedUsername;

      if (!userId && !username) {
        alert(
          "Cannot ban this user because user ID and username are missing."
        );
        return;
      }

      const confirmBan = window.confirm(
        `Ban ${username || "this user"}?`
      );

      if (!confirmBan) return;

      setLoadingAction(report._id + "ban");

      if (userId) {
        await API.patch(`/admin/users/${userId}/ban`, {
          reason: report.reason || "Reported by user",
        });
      } else {
        await API.patch(
          `/admin/users/username/${encodeURIComponent(username)}/ban`,
          {
            reason: report.reason || "Reported by user",
          }
        );
      }

      await fetchAdminData();
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to ban user");
    } finally {
      setLoadingAction("");
    }
  };

  const unbanReportedUser = async (report: any) => {
    try {
      const userId = report.reportedUserId?._id || report.reportedUserId;
      const username =
        report.reportedUserId?.username || report.reportedUsername;

      if (!userId && !username) {
        alert(
          "Cannot unban this user because user ID and username are missing."
        );
        return;
      }

      setLoadingAction(report._id + "unban");

      if (userId) {
        await API.patch(`/admin/users/${userId}/unban`);
      } else {
        await API.patch(
          `/admin/users/username/${encodeURIComponent(username)}/unban`
        );
      }

      await fetchAdminData();
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to unban user");
    } finally {
      setLoadingAction("");
    }
  };

  const genderData = [
    {
      name: "Male",
      value: stats?.maleUsers || 0,
    },
    {
      name: "Female",
      value: stats?.femaleUsers || 0,
    },
    {
      name: "Other",
      value: stats?.otherUsers || 0,
    },
  ];

  const barData = [
    {
      name: "Users",
      value: stats?.totalUsers || 0,
    },
    {
      name: "Premium",
      value: stats?.premiumUsers || 0,
    },
    {
      name: "Verified",
      value: stats?.verifiedUsers || 0,
    },
    {
      name: "Reports",
      value: stats?.totalReports || 0,
    },
  ];

  const colors = ["#8b5cf6", "#ec4899", "#06b6d4"];

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#070714] text-white relative overflow-hidden">
      <div className="absolute top-[-180px] left-[-180px] w-[520px] h-[520px] bg-violet-600/25 blur-[170px] rounded-full" />
      <div className="absolute bottom-[-180px] right-[-180px] w-[520px] h-[520px] bg-fuchsia-600/25 blur-[170px] rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:70px_70px]" />

      <section className="relative z-10 p-6 max-w-[1500px] mx-auto">
        <nav className="h-20 rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl px-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                STRAK Admin
              </h1>
              <p className="text-xs text-gray-400">
                Analytics and moderation dashboard
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold hover:scale-105 transition"
          >
            Refresh
          </button>
        </nav>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<Users />}
          />

          <StatCard
            title="Premium Users"
            value={stats?.premiumUsers || 0}
            icon={<Crown />}
          />

          <StatCard
            title="Verified Users"
            value={stats?.verifiedUsers || 0}
            icon={<ShieldCheck />}
          />

          <StatCard
            title="Pending Reports"
            value={stats?.pendingReports || 0}
            icon={<Flag />}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-6">
          <SmallCard
            title="Reviewed Reports"
            value={stats?.reviewedReports || 0}
          />

          <SmallCard
            title="Resolved Reports"
            value={stats?.resolvedReports || 0}
          />

          <SmallCard
            title="Total Reports"
            value={stats?.totalReports || 0}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded-[32px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-6">
            <h2 className="text-2xl font-black mb-2">
              Registered Gender Data
            </h2>

            <p className="text-gray-400 mb-6">
              Male, female and other registered users.
            </p>

            <div className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "#11111f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[32px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-6">
            <h2 className="text-2xl font-black mb-2">
              Platform Overview
            </h2>

            <p className="text-gray-400 mb-6">
              Users, premium members, verified accounts and reports.
            </p>

            <div className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />

                  <Tooltip
                    contentStyle={{
                      background: "#11111f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "white",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[12, 12, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-violet-300" />
            <h2 className="text-2xl font-black">
              Report Management
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1300px]">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-4">Reporter</th>
                  <th className="py-4">Reported User</th>
                  <th className="py-4">Reason</th>
                  <th className="py-4">Room</th>
                  <th className="py-4">Status</th>
                  <th className="py-4">Date</th>
                  <th className="py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-400"
                    >
                      No reports yet.
                    </td>
                  </tr>
                )}

                {reports.map((report) => {
                  const reportedIsBanned =
                    report.reportedUserId?.isBanned || false;

                  return (
                    <tr
                      key={report._id}
                      className="border-b border-white/5"
                    >
                      <td className="py-4">
                        <p className="font-bold text-white">
                          {report.reporterUsername ||
                            report.reporterUserId?.username ||
                            "Unknown User"}
                        </p>

                        <p className="text-xs text-gray-500 max-w-[190px] truncate">
                          {report.reporterUserId?.email ||
                            report.reporterSocket ||
                            "No reporter data"}
                        </p>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-red-300">
                            {report.reportedUsername ||
                              report.reportedUserId?.username ||
                              "Stranger"}
                          </p>

                          {reportedIsBanned && (
                            <span className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-[10px]">
                              BANNED
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 max-w-[190px] truncate">
                          {report.reportedUserId?.email ||
                            report.reportedSocket ||
                            "No reported data"}
                        </p>
                      </td>

                      <td className="py-4 text-white max-w-[210px]">
                        <p className="line-clamp-2">
                          {report.reason || "No reason"}
                        </p>
                      </td>

                      <td className="py-4 text-gray-400 max-w-[220px] truncate">
                        {report.roomId || "No room"}
                      </td>

                      <td className="py-4">
                        <StatusBadge status={report.status || "pending"} />
                      </td>

                      <td className="py-4 text-gray-400">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleString()
                          : "No date"}
                      </td>

                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              updateReport(report._id, "reviewed")
                            }
                            disabled={
                              loadingAction ===
                              report._id + "reviewed"
                            }
                            className="px-3 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition flex items-center gap-2 disabled:opacity-50"
                          >
                            <Eye size={16} />
                            Review
                          </button>

                          <button
                            onClick={() =>
                              updateReport(report._1, "resolved")
                            }
                            disabled={
                              loadingAction ===
                              report._id + "resolved"
                            }
                            className="px-3 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Resolve
                          </button>

                          {reportedIsBanned ? (
                            <button
                              onClick={() => unbanReportedUser(report)}
                              disabled={
                                loadingAction ===
                                report._id + "unban"
                              }
                              className="px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition flex items-center gap-2 disabled:opacity-50"
                            >
                              <Unlock size={16} />
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => banReportedUser(report)}
                              disabled={
                                loadingAction ===
                                report._id + "ban"
                              }
                              className="px-3 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 transition flex items-center gap-2 disabled:opacity-50"
                            >
                              <Ban size={16} />
                              Ban
                            </button>
                          )}

                          <button
                            onClick={() => removeReport(report._id)}
                            disabled={
                              loadingAction ===
                              report._id + "delete"
                            }
                            className="px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition flex items-center gap-2 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-6 shadow-2xl">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-black mt-3">
            {value}
          </h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SmallCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-[24px] bg-white/[0.05] border border-white/10 backdrop-blur-2xl p-5">
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-black mt-2">
        {value}
      </h2>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style =
    status === "resolved"
      ? "bg-green-500/10 border-green-500/20 text-green-300"
      : status === "reviewed"
      ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
      : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";

  return (
    <span
      className={`px-3 py-1 rounded-full border text-sm capitalize ${style}`}
    >
      {status}
    </span>
  );
}