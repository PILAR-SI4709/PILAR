'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default function PesertaPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [peserta, setPeserta] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchData(); }, []);

  // #PBI16 - Lihat Peserta: Mengambil data event dan daftar peserta dari API
  const fetchData = async () => {
    try {
      const [evRes, pRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/pendaftaran/event/${eventId}`),
      ]);
      setEvent(evRes.data);
      setPeserta(pRes.data);
    } catch { router.push('/dashboard/admin'); }
    finally { setLoading(false); }
  };
}

  // #PBI17 - Update Status Partisipasi: Mengirim perubahan status (Terima/Tolak) ke API
    const updateStatus = async (pendaftaranId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/pendaftaran/${pendaftaranId}/status`, { status });
      toast.success(status === 'APPROVED' ? 'Relawan diterima' : 'Relawan ditolak');
      fetchData();
    } catch { toast.error('Gagal mengubah status'); }
  };