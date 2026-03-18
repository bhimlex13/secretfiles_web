'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserCircle, Users, BookOpen, ChevronLeft, ChevronRight, Edit3, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 6;

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${username}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null); 
        throw new Error(errorData?.message || `Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      setProfileUser(data.user);
      setPosts(data.posts);
      setFollowersCount(data.user.followers?.length || 0);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const following = data.user.followers.some((f: any) => f._id === parsed.id || f === parsed.id);
        setIsFollowing(following);
      }
    } catch (error: any) {
      toast.error(error.message || "Could not load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return router.push('/login');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/follow/${username}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  const openEditModal = () => {
    setEditForm({
      username: profileUser.username,
      email: profileUser.email,
      currentPassword: '',
      newPassword: ''
    });
    setIsEditing(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.id]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      toast.success(data.message);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsEditing(false);
      
      // If they changed their username, the URL needs to update
      if (data.user.username !== username) {
        router.push(`/profile/${data.user.username}`);
      } else {
        fetchProfile(); // Just refresh the current view
      }

    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCleanSnippet = (htmlContent: string) => {
    if (!htmlContent) return '';
    let text = htmlContent.replace(/<[^>]*>?/gm, '');
    return text.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  if (isLoading) return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-500 italic">Looking up identity...</div>;
  if (!profileUser) return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-800">Identity not found in the archives.</div>;

  const isOwnProfile = currentUser && currentUser.id === profileUser._id;

  return (
    <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto relative fade-in-fast">
      <div className="mb-6 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to entries
        </Link>
      </div>

      <header className="mb-12 border-b border-slate-100 pb-8 max-w-4xl mx-auto fade-in-mid">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <UserCircle className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 font-serif">{profileUser.username}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-serif">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {followersCount} Followers</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {posts.length} Public Entries</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-6 py-2 rounded-full font-serif text-sm transition-colors shadow-sm bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-serif text-sm transition-colors shadow-sm ${
                  isFollowing 
                    ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200' 
                    : 'bg-slate-800 text-[#FDFCF8] hover:bg-slate-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm fade-in-fast">
          <div className="flex min-h-full items-start justify-center p-4 pt-12 sm:pt-20 pb-24">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative border border-slate-200">
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-700 transition-colors bg-white rounded-full p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold font-serif text-slate-900 mb-6">Modify Identity</h3>
                
                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 italic mb-1">Pen Name</label>
                    <input
                      type="text"
                      id="username"
                      required
                      value={editForm.username}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 italic mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      disabled={profileUser.isVerified}
                      value={editForm.email}
                      onChange={handleEditChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm ${
                        profileUser.isVerified 
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                          : 'border-slate-300 focus:ring-1 focus:ring-slate-800'
                      }`}
                    />
                    {profileUser.isVerified && (
                      <p className="mt-1.5 text-xs text-red-600 font-sans font-medium">
                        Your identity is fully verified. This email is permanently locked to your account for security.
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 italic mb-3">Leave password fields blank if you do not want to change it.</p>
                    <label className="block text-sm font-medium text-slate-700 italic mb-1">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={editForm.currentPassword}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 sm:text-sm mb-3"
                    />
                    
                    <label className="block text-sm font-medium text-slate-700 italic mb-1">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={editForm.newPassword}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 sm:text-sm"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isUpdating} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors disabled:opacity-70 text-sm font-medium">
                      {isUpdating ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="max-w-4xl mx-auto">
          <p className="text-slate-500 font-serif italic">This user has no public entries.</p>
        </div>
      ) : (
        <div className="fade-in-slow relative">
          <div className="columns-1 lg:columns-2 gap-12 lg:gap-16">
            {currentPosts.map((post: any) => {
              const plainTextSnippet = getCleanSnippet(post.content);

              return (
                <article key={post._id} className="break-inside-avoid mb-12 relative group bg-[#FDFCF8] p-8 rounded-r-2xl rounded-l-md border-y border-r border-[#E5E5E0] border-l-[16px] border-l-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 min-h-[300px] flex flex-col justify-between">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/10 to-transparent z-0"></div>
                  <div className="relative z-10 flex-grow flex flex-col">
                    
                    <header className="mb-6 pr-8">
                      <Link href={`/entry/${post._id}`}>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-snug hover:underline decoration-slate-300 break-words font-serif">{post.title}</h2>
                      </Link>
                      <time className="text-xs text-slate-500 italic font-serif">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                    </header>
                    
                    <div className="prose prose-slate mb-6 leading-relaxed flex-grow">
                      <p className="line-clamp-4 text-slate-600 break-words font-serif">{plainTextSnippet}</p>
                    </div>

                    <div>
                      <Link href={`/entry/${post._id}`} className="inline-block mb-6 text-sm font-serif italic text-slate-500 hover:text-slate-800 transition-colors underline decoration-slate-300 underline-offset-4 mt-2">
                        Open book...
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-8 mb-12 border-t border-slate-200 pt-8">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:hover:text-slate-600">
                <ChevronLeft className="w-5 h-5" /> <span className="text-sm font-serif italic">Previous Pages</span>
              </button>
              <span className="font-serif text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:hover:text-slate-600">
                <span className="text-sm font-serif italic">Next Pages</span> <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}