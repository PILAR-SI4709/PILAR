// PBI #28 - Syifa Rizani - Daftar Sertifikat Relawan

'use client';
import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SertifikatPage() {
  const { user, loadFromStorage } = useAuthStore();
  const [pendaftaran, setPendaftaran] = useState<any[]>([]);
  const [sertifikat, setSertifikat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string|null>(null);
  const [downloading, setDownloading] = useState<string|null>(null);
  const [previewSert, setPreviewSert] = useState<any|null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFromStorage();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/pendaftaran/my'),
        api.get('/sertifikat/my'),
      ]);
      setPendaftaran(pRes.data.filter((p: any) => p.status === 'APPROVED'));
      setSertifikat(sRes.data);
    } catch {} finally { setLoading(false); }
  };

  const getSertForPendaftaran = (pendaftaranId: string) =>
    sertifikat.find(s => s.pendaftaranId === pendaftaranId);

  // PBI #29 - Syifa Rizani - Generate dan Unduh Sertifikat PDF
  const handleGenerate = async (pendaftaranId: string) => {
    setGenerating(pendaftaranId);
    try {
      await api.post(`/sertifikat/generate/${pendaftaranId}`);
      toast.success('Sertifikat berhasil dibuat!');
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat sertifikat');
    } finally { setGenerating(null); }
  };