"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function DashboardUser() {
  const { user, loadFromStorage } = useAuthStore();
  const [pendaftaran, setPendaftaran] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, eRes] = await Promise.all([
        api.get("/pendaftaran/my"),
        api.get("/events?status=UPCOMING"),
      ]);
      setPendaftaran(pRes.data);
      setEvents(eRes.data.slice(0, 4));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const approved = pendaftaran.filter((p) => p.status === "APPROVED").length;
  const pending = pendaftaran.filter((p) => p.status === "PENDING").length;

  const statusStyle = (s: string) =>
    ({
      PENDING: {
        bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
        color: "#d97706",
        label: "Menunggu",
      },
      APPROVED: {
        bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        color: "#059669",
        label: "Diterima",
      },
      REJECTED: {
        bg: "linear-gradient(135deg, #fef2f2, #fee2e2)",
        color: "#dc2626",
        label: "Ditolak",
      },
    })[s] || { bg: "#f8fafc", color: "#94a3b8", label: s };

  if (loading)
    return (
      <DashboardLayout>
        <div style={{ color: "#b0c8d8", fontSize: "14px" }}>Memuat...</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _dashFade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .dash-stat-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .dash-stat-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(14,165,233,0.12) !important; }
        .dash-list-item { transition: all 0.2s ease !important; }
        .dash-list-item:hover { transform: translateX(4px) !important; background: linear-gradient(135deg, #f0f9ff, #fdfaf5) !important; box-shadow: 0 2px 8px rgba(14,165,233,0.06) !important; }
        .dash-section { transition: all 0.3s ease !important; }
        .dash-section:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.04) !important; }
      `}</style>

      {/* Header */}
      <div
        style={{ marginBottom: "32px", animation: "_dashFade 0.5s ease both" }}
      >
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
          Dashboard Relawan
        </p>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "700",
            color: "#0c4a6e",
            letterSpacing: "-0.02em",
          }}
        >
          Halo, {user?.nama?.split(" ")[0]} 👋
        </h1>
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
            label: "Total Event Diikuti",
            value: pendaftaran.length,
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
            label: "Pendaftaran Diterima",
            value: approved,
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ),
          },
          {
            label: "Menunggu Verifikasi",
            value: pending,
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
          },
        ].map((s, i) => (
          <div
            key={i}
            className="dash-stat-card"
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1px solid rgba(14,165,233,0.06)",
              padding: "22px 20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              animation: `_dashFade 0.5s ease ${0.1 * i}s both`,
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

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Riwayat Pendaftaran */}
        <div
          className="dash-section"
          style={{
            background: "#fff",
            borderRadius: "18px",
            border: "1px solid rgba(14,165,233,0.06)",
            padding: "22px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
            animation: "_dashFade 0.5s ease 0.3s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
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
              Riwayat Pendaftaran
            </h2>
            <Link
              href="/#events"
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
              Cari event
            </Link>
          </div>
          {pendaftaran.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 0",
                color: "#b0c8d8",
                fontSize: "13px",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d4e2ed"
                strokeWidth="1.5"
                style={{ margin: "0 auto 10px", display: "block" }}
              >
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Belum ada pendaftaran
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {pendaftaran.slice(0, 6).map((p: any) => {
                const st = statusStyle(p.status);
                return (
                  <Link
                    key={p.id}
                    href={`/events/${p.event?.id}`}
                    className="dash-list-item"
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "11px 14px",
                      background: "#fdfcfa",
                      borderRadius: "12px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#0c4a6e",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                        }}
                      >
                        {p.event?.judul}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b0c8d8",
                          marginTop: "3px",
                        }}
                      >
                        {p.event?.tanggal
                          ? format(new Date(p.event.tanggal), "d MMM yyyy", {
                              locale: id,
                            })
                          : "-"}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: st.bg,
                        color: st.color,
                        flexShrink: 0,
                      }}
                    >
                      {st.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Event Mendatang */}
        <div
          className="dash-section"
          style={{
            background: "#fff",
            borderRadius: "18px",
            border: "1px solid rgba(14,165,233,0.06)",
            padding: "22px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
            animation: "_dashFade 0.5s ease 0.4s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
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
              Event Mendatang
            </h2>
            <Link
              href="/#events"
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
              Lihat semua
            </Link>
          </div>
          {events.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 0",
                color: "#b0c8d8",
                fontSize: "13px",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d4e2ed"
                strokeWidth="1.5"
                style={{ margin: "0 auto 10px", display: "block" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Tidak ada event mendatang
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {events.map((e: any) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="dash-list-item"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 14px",
                    background: "#fdfcfa",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
                      flexShrink: 0,
                      overflow: "hidden",
                      boxShadow: "0 2px 6px rgba(14,165,233,0.1)",
                    }}
                  >
                    {e.gambar && (
                      <img
                        src={e.gambar}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#0c4a6e",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {e.judul}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
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
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#0ea5e9",
                      flexShrink: 0,
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background: "rgba(14,165,233,0.06)",
                    }}
                  >
                    {e.tanggal
                      ? format(new Date(e.tanggal), "d MMM", { locale: id })
                      : "-"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
