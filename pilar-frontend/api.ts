export async function getAllEvents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, { cache: 'no-store' });
  return res.json();
}

export async function getEventById(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`, { cache: 'no-store' });
  return res.json();
}