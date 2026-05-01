"use client";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fdfaf5" }}>
      <Sidebar />
      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          padding: "32px 40px",
          minHeight: "100vh",
          maxWidth: "1200px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
