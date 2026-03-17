'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';

export default function LibraryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMyPosts(token);
  }, [router]);

  const fetchMyPosts = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch library');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCleanSnippet = (htmlContent: string) => {
    if (!htmlContent) return '';
    let text = htmlContent.replace(/<[^>]*>?/gm, '');
    text = text.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return text;
  };

  if (isLoading) {
    return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-500 dark:text-red-900/50 italic">Opening your library...</div>;
  }

  return (
    <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto relative">
      <div className="mb-6 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-red-500 transition-colors font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to entries
        </Link>
      </div>

      <header className="mb-12 border-b border-slate-100 dark:border-red-950/50 pb-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-red-50 mb-2 font-serif">My Library</h1>
        <p className="text-slate-500 dark:text-zinc-500 font-serif italic text-sm">
          A private collection of everything you have written.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="max-w-4xl mx-auto">
          <p className="text-slate-500 dark:text-zinc-600 font-serif italic">You have not written any entries yet.</p>
        </div>
      ) : (
        <div className="columns-1 lg:columns-2 gap-12 lg:gap-16">
          {posts.map((post: any) => {
            const plainTextSnippet = getCleanSnippet(post.content);

            return (
              <article key={post._id} className="break-inside-avoid mb-12 relative group bg-[#FDFCF8] dark:bg-zinc-950 p-8 rounded-r-2xl rounded-l-md border-y border-r border-[#E5E5E0] dark:border-red-950/30 border-l-[16px] border-l-slate-800 dark:border-l-red-950 shadow-md hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(153,27,27,0.15)] hover:-translate-y-1 transition-all duration-500 min-h-[300px] flex flex-col justify-between">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/10 to-transparent dark:from-black/40 z-0"></div>
                <div className="relative z-10 flex-grow flex flex-col">
                  
                  {/* Edit Button */}
                  <div className="absolute -right-2 top-0">
                    <Link
                      href={`/edit/${post._id}`}
                      className="p-2 inline-block rounded-full transition-colors text-slate-400 dark:text-zinc-700 hover:text-slate-800 dark:hover:text-red-500 hover:bg-slate-50 dark:hover:bg-red-900/20"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                  </div>

                  <header className="mb-6 pr-8">
                    <Link href={`/entry/${post._id}`}>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-red-100 mb-3 leading-snug hover:underline decoration-slate-300 dark:decoration-red-900/50 break-words font-serif">{post.title}</h2>
                    </Link>
                    <div className="flex flex-col gap-1 text-sm text-slate-500 dark:text-zinc-500 italic font-serif">
                      <span>{post.isAnonymous ? 'Published Anonymously' : 'Published Publicly'}</span>
                      <time className="text-xs">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                      {post.editedAt && <span className="text-xs opacity-70">(Edited)</span>}
                    </div>
                  </header>
                  
                  <div className="prose prose-slate dark:prose-invert mb-6 leading-relaxed flex-grow">
                    <p className="line-clamp-4 text-slate-600 dark:text-zinc-400 break-words font-serif">{plainTextSnippet}</p>
                  </div>

                  <div>
                    <Link href={`/entry/${post._id}`} className="inline-block mb-6 text-sm font-serif italic text-slate-500 dark:text-red-800 hover:text-slate-800 dark:hover:text-red-500 transition-colors underline decoration-slate-300 dark:decoration-red-900/30 underline-offset-4 mt-2">
                      Open book...
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}