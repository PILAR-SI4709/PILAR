 // PBI #28 - Syifa Rizani - Daftar Sertifikat Relawan
  // Ambil semua sertifikat milik user
  async getMySertifikat(userId: string) {
    return this.prisma.sertifikat.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true, judul: true,
            tanggal: true, lokasi: true, gambar: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }