// src/app/page.tsx
import Link from 'next/link';
import { PenTool } from 'lucide-react';
import { Story } from '../types';
import StoryCard from '../components/StoryCard';

// Fetch stories from our local backend
async function getStories(): Promise<Story[]> {
  try {
    // Replaced localhost with the environment variable
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch stories');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Home() {
  const stories = await getStories();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Every secret has a <span className="text-indigo-600">story.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          A safe space to share your experiences, unburden your mind, and read stories from people just like you. 100% anonymous if you choose to be.
        </p>
        <Link 
          href="/create" 
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <PenTool className="w-5 h-5" />
          Share Your Secret
        </Link>
      </section>

      {/* Story Feed Section */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Recent Secrets</h2>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {stories.length} stories
          </span>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No secrets shared yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {stories.map((story, index) => (
              <StoryCard key={story._id} story={story} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}