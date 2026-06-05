























































































// PBI #40 - Naufal Athalino - Halaman Rekap Statistik Keseluruhan Program
  // Rekap agregat seluruh event untuk evaluasi capaian program (halaman terpisah)
  async getRekap() {
    const [sampahData, totalRelawanAktif, totalEventSelesai] = await Promise.all([
      this.prisma.sampah.aggregate({
        _sum: { jumlahKg: true },
      }),
      this.prisma.pendaftaran.count({
        where: { status: 'APPROVED' },
      }),
      this.prisma.event.count({
        where: { status: 'DONE' },
      }),
    ]);

    return {
      totalSampahKg: sampahData._sum.jumlahKg || 0,
      totalRelawanAktif,
      totalEventSelesai,
    };
  }
