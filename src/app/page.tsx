'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PenLine, Bookmark } from 'lucide-react';
import { useTheme } from '../components/NavigationLayout';

interface Comment { _id: string; text: string; user: string; }
interface Reactions { support: string[]; relate: string[]; happy: string[]; sad: string[]; angry: string[]; insightful: string[]; }
interface Post { _id: string; title: string; content: string; author: { username: string } | string; isAnonymous: boolean; tags: string[]; reactions: Reactions; comments: Comment[]; createdAt: string; }

export default function Home() {
  const router = useRouter();
  const { isMidnight } = useTheme();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      fetchBookmarks();
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch entries');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bookmarks`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds(data.filter((b: any) => b !== null).map((b: any) => b._id));
      }
    } catch (err) { console.error(err); }
  };

  const handleBookmark = async (postId: string) => {
    if (!currentUser) return router.push('/login');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bookmarks/${postId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds(data.bookmarks);
      }
    } catch (err) { console.error(err); }
  };

  const getCleanSnippet = (htmlContent: string) => {
    if (!htmlContent) return '';
    let text = htmlContent.replace(/<[^>]*>?/gm, '');
    return text.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  const ghostTags = ['ghost', 'paranormal', 'horror', 'creature', 'unexplained', 'scary'];
  
  const themeFilteredPosts = posts.filter(post => {
    const isGhostStory = post.tags.some(tag => ghostTags.includes(tag.toLowerCase()));
    return isMidnight ? isGhostStory : !isGhostStory;
  });

  const finalFilteredPosts = themeFilteredPosts.filter(post => {
    const query = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(query) || 
           post.content.toLowerCase().includes(query) ||
           post.tags.some(tag => tag.toLowerCase().includes(query));
  });

  const quickFilters = isMidnight 
    ? ['Ghost', 'Paranormal', 'Unexplained'] 
    : ['Love', 'Family', 'Work', 'Advice'];

  return (
    <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto relative">
      
      <header className="mb-16 text-center transition-colors duration-1000">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif dark:text-red-50">
          {isMidnight ? 'The Midnight Archives' : 'Dear Stranger,'}
        </h1>
        <p className="text-slate-500 dark:text-red-900 italic">
          {isMidnight ? 'Stories from the other side. Read with caution.' : 'Read the pages of others. You are not alone.'}
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-20">
        <div className="relative mb-4">
          <Search className="absolute left-0 top-3 w-5 h-5 text-slate-400 dark:text-zinc-600" />
          <input 
            type="text" 
            placeholder={isMidnight ? "Search the archives..." : "Search past entries or feelings..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-8 bg-transparent border-b border-slate-300 dark:border-red-950/50 focus:border-slate-800 dark:focus:border-red-600 outline-none text-lg placeholder:text-slate-400 dark:placeholder:text-zinc-700 placeholder:italic transition-colors dark:text-zinc-200"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setSearchQuery('')} className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400 italic transition-colors">Clear</button>
          {quickFilters.map(filter => (
            <button 
              key={filter}
              onClick={() => setSearchQuery(filter)}
              className="text-xs text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-red-950/50 px-3 py-1 rounded-full hover:border-slate-400 dark:hover:border-red-800 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500 dark:text-red-900/50 italic">Reading pages...</div>
      ) : finalFilteredPosts.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-zinc-600 italic">
          {isMidnight ? 'The archives are empty. No spirits found.' : 'No entries found matching your search.'}
        </div>
      ) : (
        
        <div className="relative">
          <div className="columns-1 lg:columns-2 gap-12 lg:gap-16">
            {finalFilteredPosts.map((post) => {
              const plainTextSnippet = getCleanSnippet(post.content);

              return (
                /* The new Book Cover wrapper */
                <article key={post._id} className="break-inside-avoid mb-12 relative group bg-[#FDFCF8] dark:bg-zinc-950 p-8 rounded-r-2xl rounded-l-md border-y border-r border-[#E5E5E0] dark:border-red-950/30 border-l-[16px] border-l-slate-800 dark:border-l-red-950 shadow-md hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(153,27,27,0.15)] hover:-translate-y-1 transition-all duration-500 min-h-[300px] flex flex-col justify-between">
                  
                  {/* Subtle crease effect for the book binding */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/10 to-transparent dark:from-black/40 z-0"></div>
                  
                  <div className="relative z-10 flex-grow flex flex-col">
                    
                    <div className="absolute -right-2 top-0">
                      <button
                        onClick={() => handleBookmark(post._id)}
                        className={`p-2 rounded-full transition-colors ${
                          bookmarkedIds.includes(post._id) ? 'text-slate-800 dark:text-red-500 bg-slate-100 dark:bg-red-950/30' : 'text-slate-300 dark:text-zinc-700 hover:text-slate-800 dark:hover:text-red-400'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarkedIds.includes(post._id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <header className="mb-6 pr-8">
                      <Link href={`/entry/${post._id}`}>
                        {/* Smaller, elegant title size */}
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-red-100 mb-3 leading-snug hover:underline decoration-slate-300 dark:decoration-red-900/50 break-words font-serif">{post.title}</h2>
                      </Link>
                      <div className="flex flex-col gap-1 text-sm text-slate-500 dark:text-zinc-500 italic font-serif">
                        <span>By {post.isAnonymous ? 'Anonymous' : (typeof post.author === 'object' ? post.author.username : 'Author')}</span>
                        <time className="text-xs">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                      </div>
                    </header>
                    
                    <div className="prose prose-slate dark:prose-invert mb-6 leading-relaxed flex-grow">
                      <p className="line-clamp-4 text-slate-600 dark:text-zinc-400 break-words font-serif">
                        {plainTextSnippet}
                      </p>
                    </div>

                    <div>
                      <Link href={`/entry/${post._id}`} className="inline-block mb-6 text-sm font-serif italic text-slate-500 dark:text-red-800 hover:text-slate-800 dark:hover:text-red-500 transition-colors underline decoration-slate-300 dark:decoration-red-900/30 underline-offset-4 mt-2">
                        Open book...
                      </Link>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-auto">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="text-xs text-slate-500 dark:text-zinc-600 border border-slate-200 dark:border-red-950/30 px-2 py-1 rounded-sm font-serif">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {currentUser && (
        <Link 
          href="/create" 
          className="fixed bottom-8 right-8 bg-slate-800 dark:bg-red-900/80 text-[#FDFCF8] dark:text-red-50 p-4 rounded-full shadow-lg hover:bg-slate-700 dark:hover:bg-red-800 hover:scale-105 transition-all flex items-center gap-2 group z-50 border border-transparent dark:border-red-700/50"
        >
          <PenLine className="w-6 h-6" />
          <span className="font-serif font-medium pr-2 hidden group-hover:block whitespace-nowrap overflow-hidden">
            {isMidnight ? 'Record Sighting' : 'Write Entry'}
          </span>
        </Link>
      )}
    </div>
  );
}