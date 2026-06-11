"use client";
// PBI #39 - Naufal Athalino - Detail Laporan Event (peserta hadir, sampah terkumpul, galeri dokumentasi)
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/Sidebar";
import api from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function LaporanDetailPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const [laporan, setLaporan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      const res = await api.get(`/laporan/${eventId}`);
      setLaporan(res.data);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div style={{ color: "#b0c8d8" }}>Memuat...</div>
      </DashboardLayout>
    );
  if (!laporan) return null;

  const { event, ringkasan, peserta, dokumentasi, sampah } = laporan;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "800px" }}>
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#7baac7",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "4px",
            }}
          >
            Laporan Kegiatan
          </p>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "600",
              color: "#0c4a6e",
              letterSpacing: "-0.02em",
            }}
          >
            {event.judul}
          </h1>
          <p style={{ fontSize: "13px", color: "#7baac7", marginTop: "4px" }}>
            {event.lokasi} ·{" "}
            {event.tanggal
              ? format(new Date(event.tanggal), "d MMMM yyyy", { locale: id })
              : "-"}
          </p>
        </div>

        {/* Ringkasan */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "Peserta Hadir",
              value: ringkasan.totalPeserta,
              color: "#0369a1",
            },
            {
              label: "Foto Dokumentasi",
              value: ringkasan.totalDokumentasi,
              color: "#059669",
            },
            {
              label: "Sampah (kg)",
              value: ringkasan.totalSampahKg.toLocaleString("id-ID"),
              color: "#d97706",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #f5f0e8",
                padding: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#7baac7",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: s.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Data Sampah */}
        {sampah.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #f5f0e8",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#1a2332",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "14px",
              }}
            >
              Rincian Sampah
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {sampah.map((s: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#fdfaf5",
                    borderRadius: "10px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#1a2332" }}>
                    {s.jenis}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#0369a1",
                    }}
                  >
                    {s.jumlahKg} kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galeri Dokumentasi */}
        {dokumentasi.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #f5f0e8",
              padding: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#1a2332",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "14px",
              }}
            >
              Galeri Dokumentasi
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "10px",
              }}
            >
              {dokumentasi.map((d: any) => (
                <div
                  key={d.id}
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    aspectRatio: "1",
                  }}
                >
                  <img
                    src={d.fotoUrl}
                    alt={d.caption || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
