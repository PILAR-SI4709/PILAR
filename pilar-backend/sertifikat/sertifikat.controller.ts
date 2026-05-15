// PBI #28 - Syifa Rizani - Daftar Sertifikat Relawan
  // User lihat semua sertifikat miliknya
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMySertifikat(@Request() req) {
    return this.sertifikatService.getMySertifikat(req.user.id);
  }

  // Detail sertifikat by ID (untuk render di frontend)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.sertifikatService.getById(id);
  }