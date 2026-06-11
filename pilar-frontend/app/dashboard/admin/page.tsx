"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

export default function DashboardAdmin() {
  const { user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEvent: 0,
    totalRelawan: 0,
    totalSampahKg: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    fetchData();
  }, []);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user]);

  const fetchData = async () => {
    try {
      const [stRes, evRes] = await Promise.all([
        api.get("/events/stats"),
        api.get("/events"),
      ]);
      setStats(stRes.data);
      setEvents(evRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      await api.delete(`/events/${eventId}`);
      toast.success("Event dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus event");
    }
  };

  const statusStyle = (s: string) =>
    ({
      UPCOMING: {
        color: "#0369a1",
        bg: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
        label: "Mendatang",
      },
      ONGOING: {
        color: "#059669",
        bg: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
        label: "Berlangsung",
      },
      DONE: {
        color: "#94a3b8",
        bg: "linear-gradient(135deg, #f1f5f9, #f8fafc)",
        label: "Selesai",
      },
    })[s] || { color: "#94a3b8", bg: "#f8fafc", label: s };

  if (loading)
    return (
      <DashboardLayout>
        <div style={{ color: "#b0c8d8", fontSize: "14px" }}>Memuat...</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _adminFade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .admin-stat { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .admin-stat:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(14,165,233,0.12) !important; }
        .admin-row { transition: all 0.2s ease !important; }
        .admin-row:hover { background: linear-gradient(135deg, #f0f9ff, #fdfcfa) !important; }
        .admin-action { transition: all 0.2s ease !important; }
        .admin-action:hover { transform: translateY(-1px) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; }
        .admin-add-btn { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .admin-add-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(14,165,233,0.3) !important; }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
          animation: "_adminFade 0.5s ease both",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "#0ea5e9",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Dashboard Administrator
          </p>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "#0c4a6e",
              letterSpacing: "-0.02em",
            }}
          >
            Selamat datang, {user?.nama?.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/dashboard/admin/events/new"
          className="admin-add-btn"
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#fff",
            background: "linear-gradient(135deg,#0ea5e9,#0369a1)",
            padding: "10px 22px",
            borderRadius: "12px",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(14,165,233,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Event
        </Link>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          {
            label: "Total Event",
            value: stats.totalEvent,
            color: "#0369a1",
            gradient: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0369a1"
                strokeWidth="1.8"
              >
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
          },
          {
            label: "Total Relawan",
            value: stats.totalRelawan,
            color: "#059669",
            gradient: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="1.8"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
          {
            label: "Sampah Terkumpul",
            value: `${stats.totalSampahKg.toLocaleString("id-ID")} kg`,
            color: "#d97706",
            gradient: "linear-gradient(135deg, #fef3c7, #fffbeb)",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d97706"
                strokeWidth="1.8"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            ),
          },
        ].map((s, i) => (
          <div
            key={i}
            className="admin-stat"
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid rgba(14,165,233,0.06)",
              padding: "22px 20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              animation: `_adminFade 0.5s ease ${0.1 * i}s both`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: s.gradient,
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: s.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#7baac7",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: "500",
                }}
              >
                {s.label}
              </div>
            </div>
            <div
              style={{
                fontSize: "40px",
                fontWeight: "700",
                color: s.color,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Event */}
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid rgba(14,165,233,0.06)",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          animation: "_adminFade 0.5s ease 0.3s both",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid rgba(14,165,233,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#0c4a6e",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Semua Event
          </h2>
          <Link
            href="/dashboard/admin/events"
            style={{
              fontSize: "12px",
              color: "#0ea5e9",
              textDecoration: "none",
              fontWeight: "500",
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(14,165,233,0.06)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(14,165,233,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(14,165,233,0.06)")
            }
          >
            Kelola semua
          </Link>
        </div>

        {events.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              color: "#b0c8d8",
              fontSize: "13px",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4e2ed"
              strokeWidth="1.5"
              style={{ margin: "0 auto 12px", display: "block" }}
            >
              <rect x="3" y="4" width="18" height="18" rx="3" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Belum ada event
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg, #f8fbff, #fdfaf5)",
                }}
              >
                {["Event", "Tanggal", "Relawan", "Status", "Aksi"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 18px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#7baac7",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e: any) => {
                const st = statusStyle(e.status);
                return (
                  <tr
                    key={e.id}
                    className="admin-row"
                    style={{ borderTop: "1px solid rgba(14,165,233,0.04)" }}
                  >
                    <td style={{ padding: "14px 18px" }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: "600",
                          color: "#0c4a6e",
                        }}
                      >
                        {e.judul}
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "#7baac7",
                          marginTop: "3px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {e.lokasi}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        fontSize: "12.5px",
                        color: "#4a6580",
                      }}
                    >
                      {e.tanggal
                        ? format(new Date(e.tanggal), "d MMM yyyy", {
                            locale: id,
                          })
                        : "-"}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "60px",
                            height: "4px",
                            borderRadius: "2px",
                            background: "#f0f9ff",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(100, ((e._count?.pendaftaran || 0) / e.kuota) * 100)}%`,
                              background:
                                "linear-gradient(to right,#38bdf8,#0369a1)",
                              borderRadius: "2px",
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#4a6580",
                            fontWeight: "500",
                          }}
                        >
                          {e._count?.pendaftaran || 0}/{e.kuota}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link
                          href={`/dashboard/admin/events/${e.id}/peserta`}
                          className="admin-action"
                          style={{
                            fontSize: "12px",
                            color: "#0369a1",
                            textDecoration: "none",
                            padding: "5px 10px",
                            background: "rgba(14,165,233,0.06)",
                            borderRadius: "7px",
                            fontWeight: "500",
                          }}
                        >
                          Relawan
                        </Link>
                        <Link
                          href={`/dashboard/admin/events/${e.id}/edit`}
                          className="admin-action"
                          style={{
                            fontSize: "12px",
                            color: "#4a6580",
                            textDecoration: "none",
                            padding: "5px 10px",
                            background: "#f8fafc",
                            borderRadius: "7px",
                            fontWeight: "500",
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="admin-action"
                          style={{
                            fontSize: "12px",
                            color: "#dc2626",
                            background: "#fef2f2",
                            border: "none",
                            cursor: "pointer",
                            padding: "5px 10px",
                            borderRadius: "7px",
                            fontWeight: "500",
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
