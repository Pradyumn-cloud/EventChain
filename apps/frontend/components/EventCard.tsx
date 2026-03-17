import Link from 'next/link';

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
};

export function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition">

        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover"
        />

        <div className="p-6">

          <div className="text-sm text-purple-400 mb-2">
            {event.category}
          </div>

          <h3 className="text-xl font-semibold mb-3">
            {event.title}
          </h3>

          <p className="text-gray-400 text-sm mb-1">
            📅 {event.date}
          </p>

          <p className="text-gray-400 text-sm mb-1">
            ⏰ {event.time}
          </p>

          <p className="text-gray-400 text-sm mb-4">
            📍 {event.location}
          </p>

          <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg">
            View Event
          </button>

        </div>
      </div>
    </Link>
  );
}