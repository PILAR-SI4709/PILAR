import { getEventById } from '@/lib/api';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">{event.judul}</h1>
      <p className="mt-4 text-gray-700">{event.deskripsi}</p>
      
      <div className="mt-6 border-t pt-4">
        <p><strong>Lokasi:</strong> {event.lokasi}</p>
        <p><strong>Tanggal:</strong> {new Date(event.tanggal).toLocaleDateString()}</p>
        {/* Tambahkan logika pendaftaran di sini */}
      </div>
    </main>
  );
}