'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profileData, setProfileData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      
      setProfileData(data.user);
      setPosts(data.posts);
      setFollowerCount(data.user.followers.length);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const following = data.user.followers.some((f: any) => f._id === parsedUser.id);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followersCount);
      }
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  const getCleanSnippet = (htmlContent: string) => {
    if (!htmlContent) return '';
    let text = htmlContent.replace(/<[^>]*>?/gm, '');
    text = text.replace(/&nbsp;/g, ' ')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>');
    return text;
  };

  if (isLoading) {
    return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-500 dark:text-red-900/50 italic">Finding author...</div>;
  }

  if (!profileData) {
    return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-800 dark:text-zinc-500">Author not found.</div>;
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="py-12 px-4 md:px-12 max-w-4xl mx-auto">
      
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-red-500 transition-colors font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to entries
        </Link>
      </div>

      {/* Eerie Dark Mode Container: Pitch black with a faint red border */}
      <div className="w-full bg-white dark:bg-zinc-950 shadow-sm relative overflow-hidden border border-[#E5E5E0] dark:border-red-950/50 min-h-[80vh] transition-colors duration-1000">
        
        <div className="absolute left-10 md:left-16 top-0 bottom-0 w-px bg-red-200 dark:bg-red-900/20 z-0"></div>

        <div className="relative z-10 pl-16 md:pl-24 pr-8 md:pr-12 py-12">
          
          <header className="mb-12 border-b border-slate-100 dark:border-red-950/50 pb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-red-50 mb-2 font-serif">{profileData.username}'s Journal</h1>
              <div className="flex gap-4 text-slate-500 dark:text-zinc-500 font-serif italic text-sm">
                <span>{followerCount} Followers</span>
                <span>{profileData.following.length} Following</span>
              </div>
            </div>

            {!isOwnProfile && (
              <button 
                onClick={handleFollow}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-serif transition-colors ${
                  isFollowing 
                    ? 'bg-slate-100 dark:bg-red-950/30 text-slate-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600' 
                    : 'bg-slate-800 dark:bg-red-900/20 text-white dark:text-red-400 border border-transparent dark:border-red-900/30 hover:bg-slate-700 dark:hover:bg-red-900/40'
                }`}
              >
                {isFollowing ? (
                  <><UserMinus className="w-4 h-4" /> Unfollow</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Follow</>
                )}
              </button>
            )}
          </header>

          <div className="space-y-12">
            <h2 className="text-2xl font-serif text-slate-800 dark:text-red-900 mb-6 italic">Public Entries</h2>
            
            {posts.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-600 font-serif italic">This author has not published any public entries yet.</p>
            ) : (
              posts.map((post) => {
                const plainTextSnippet = getCleanSnippet(post.content);

                return (
                  // Eerie Hover Effect: Deep black card that glows faint red on hover
                  <article key={post._id} className="group border border-slate-100 dark:border-red-950/30 p-6 bg-[#FDFCF8] dark:bg-black hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(153,27,27,0.1)] transition-all duration-500">
                    <Link href={`/entry/${post._id}`}>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-red-100 mb-2 font-serif group-hover:underline decoration-slate-300 dark:decoration-red-900/50 break-words">{post.title}</h3>
                    </Link>
                    <time className="text-xs text-slate-400 dark:text-zinc-600 italic font-serif block mb-4">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </time>
                    <div className="prose prose-slate dark:prose-invert mb-2 leading-relaxed">
                      <p className="font-serif text-slate-600 dark:text-zinc-400 line-clamp-4 break-words">
                        {plainTextSnippet}
                      </p>
                    </div>
                    
                    <Link href={`/entry/${post._id}`} className="inline-block text-sm font-serif italic text-slate-500 dark:text-red-800 hover:text-slate-800 dark:hover:text-red-500 transition-colors underline decoration-slate-300 dark:decoration-red-900/30 underline-offset-4 mt-2">
                      Read full entry...
                    </Link>
                  </article>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}