import { getAllEvents } from '@/lib/api';
import Link from 'next/link';

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Daftar Kegiatan</h1>
      <div className="grid gap-4">
        {events.map((event: any) => (
          <div key={event.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{event.judul}</h2>
            <p>{event.lokasi}</p>
            <Link href={`/events/${event.id}`} className="text-blue-600 underline">
              Lihat Detail
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}