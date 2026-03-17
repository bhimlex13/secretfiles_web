'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PenTool, Bookmark, LogOut, Moon, Sun, Ghost, Home, UserCircle, Library } from 'lucide-react';

const ThemeContext = createContext({ isMidnight: false, toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMidnight, setIsMidnight] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  
  // Hydration fix state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));
    else setCurrentUser(null);
  }, [pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'midnight') setIsMidnight(true);
    
    // Tell Next.js we have finished loading the theme and it is safe to render
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsMidnight(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'midnight' : 'stranger');
      return newTheme;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  // Prevents the Hydration mismatch error by waiting for the client to mount
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isMidnight, toggleTheme }}>
      <div className={`${isMidnight ? 'dark' : ''}`}>
        <div className="flex min-h-screen bg-[#FDFCF8] dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 transition-colors duration-1000 font-serif selection:bg-slate-200 dark:selection:bg-red-900/30">

          <aside className="w-20 lg:w-64 fixed h-screen border-r border-[#E5E5E0] dark:border-red-950/50 bg-[#FDFCF8]/95 dark:bg-black/95 backdrop-blur-md flex flex-col justify-between py-8 px-4 lg:px-8 z-50 transition-colors duration-1000">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-16">
                {isMidnight ? <Ghost className="w-8 h-8 text-red-700" /> : <PenTool className="w-8 h-8 text-slate-800" />}
                <span className="hidden lg:block font-bold text-xl tracking-tight dark:text-red-50 transition-colors">
                  {isMidnight ? 'Midnight Archives' : 'Dear Stranger'}
                </span>
              </Link>

              <nav className="space-y-8">
                <Link href="/" className={`flex items-center gap-4 text-sm transition-colors ${pathname === '/' ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                  <Home className="w-5 h-5" /> <span className="hidden lg:block tracking-wide">Feed</span>
                </Link>
                {currentUser && (
                  <>
                    <Link href="/bookmarks" className={`flex items-center gap-4 text-sm transition-colors ${pathname === '/bookmarks' ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                      <Bookmark className="w-5 h-5" /> <span className="hidden lg:block tracking-wide">Saved</span>
                    </Link>
                    <Link href="/library" className={`flex items-center gap-4 text-sm transition-colors ${pathname === '/library' ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                      <Library className="w-5 h-5" /> <span className="hidden lg:block tracking-wide">My Library</span>
                    </Link>
                    <Link href={`/profile/${currentUser.username}`} className={`flex items-center gap-4 text-sm transition-colors ${pathname.startsWith('/profile') ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                      <UserCircle className="w-5 h-5" /> <span className="hidden lg:block tracking-wide">Profile</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="space-y-8">
              <button onClick={toggleTheme} className="flex items-center gap-4 text-sm text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-500 transition-colors w-full group">
                {isMidnight ? <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />}
                <span className="hidden lg:block tracking-wide">{isMidnight ? 'Return to Light' : 'Enter Midnight'}</span>
              </button>

              {currentUser ? (
                <button onClick={handleLogout} className="flex items-center gap-4 text-sm text-red-500 hover:text-red-700 dark:text-red-900 dark:hover:text-red-700 transition-colors w-full">
                  <LogOut className="w-5 h-5" /> <span className="hidden lg:block tracking-wide">Logout</span>
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-4 text-sm text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400 transition-colors">
                  <LogOut className="w-5 h-5" /> <span className="hidden lg:block tracking-wide">Login</span>
                </Link>
              )}
            </div>
          </aside>

          <main className="flex-1 ml-20 lg:ml-64 relative min-h-screen">
            {children}
          </main>

        </div>
      </div>
    </ThemeContext.Provider>
  );
}