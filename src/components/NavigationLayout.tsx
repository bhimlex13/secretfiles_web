'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PenTool, Bookmark as BookmarkIcon, LogOut, Moon, Sun, Ghost, Home, UserCircle, Library } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ThemeContext = createContext({ isMidnight: false, toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMidnight, setIsMidnight] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Navigation State
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop
  const [isMobileOpen, setIsMobileOpen] = useState(false); // For mobile

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));
    else setCurrentUser(null);
  }, [pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'midnight') setIsMidnight(true);
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    setIsMidnight(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'midnight' : 'stranger');
      return newTheme;
    });
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setShowLogoutModal(false);
    toast.success('Safely logged out of the archives.');
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isMidnight, toggleTheme }}>
      <div className={`${isMidnight ? 'dark' : ''} overflow-x-hidden`}>
        
        <Toaster 
          position="bottom-right" 
          toastOptions={{ 
            className: 'font-serif text-sm shadow-md',
            duration: 4000,
            style: {
              background: isMidnight ? '#000000' : '#FDFCF8',
              color: isMidnight ? '#fef2f2' : '#1e293b',
              border: isMidnight ? '1px solid #450a0a' : '1px solid #E5E5E0',
            },
            success: { iconTheme: { primary: isMidnight ? '#7f1d1d' : '#1e293b', secondary: isMidnight ? '#000000' : '#FDFCF8' } },
          }} 
        />

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity px-4">
            <div className="bg-[#FDFCF8] dark:bg-zinc-950 border border-[#E5E5E0] dark:border-red-950/50 p-8 shadow-2xl max-w-sm w-full relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 dark:bg-red-900/50"></div>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-red-50 mb-2 pl-4">Leave the archives?</h3>
              <p className="text-slate-500 dark:text-zinc-400 italic text-sm mb-8 font-serif pl-4">You will need to use your key to enter again.</p>
              <div className="flex justify-end gap-4 pl-4">
                <button onClick={() => setShowLogoutModal(false)} className="px-5 py-2 text-sm font-serif text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-red-400 transition-colors">Stay</button>
                <button onClick={confirmLogout} className="px-5 py-2 text-sm font-serif bg-slate-800 dark:bg-red-900/80 text-[#FDFCF8] dark:text-red-50 hover:bg-slate-700 dark:hover:bg-red-800 transition-colors shadow-sm">Lock the door</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex min-h-screen bg-[#FDFCF8] dark:bg-zinc-950 text-slate-800 dark:text-zinc-300 transition-colors duration-1000 font-serif selection:bg-slate-200 dark:selection:bg-red-900/30">

          {/* Mobile Dark Overlay */}
          {isMobileOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-[80] lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside 
            className={`fixed h-screen border-r border-[#E5E5E0] dark:border-red-950/50 bg-[#FDFCF8]/95 dark:bg-black/95 backdrop-blur-md flex flex-col justify-between py-8 z-[90] transition-all duration-500 ease-in-out
              ${isCollapsed ? 'w-20' : 'w-64'} 
              ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            {/* The Physical Bookmark Toggle */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setIsMobileOpen(!isMobileOpen);
                else setIsCollapsed(!isCollapsed);
              }}
              className="absolute top-12 -right-10 lg:-right-8 w-10 lg:w-8 h-20 bg-slate-800 dark:bg-red-900 flex items-start justify-center pt-4 text-[#FDFCF8] shadow-xl hover:brightness-110 transition-all z-50 group cursor-pointer"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
              title="Toggle Menu"
            >
              <BookmarkIcon className="w-4 h-4 fill-current opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className={`px-6 flex flex-col items-center lg:items-start overflow-hidden`}>
              <Link href="/" className="flex items-center gap-3 mb-16 whitespace-nowrap overflow-hidden w-full">
                <div className="min-w-[24px]">
                  {isMidnight ? <Ghost className="w-6 h-6 text-red-700" /> : <PenTool className="w-6 h-6 text-slate-800" />}
                </div>
                <span className={`font-bold text-xl tracking-widest uppercase dark:text-red-50 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>
                  Veil
                </span>
              </Link>

              <nav className="space-y-8 w-full">
                <Link href="/" className={`flex items-center gap-4 text-sm transition-colors ${pathname === '/' ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                  <Home className="w-5 h-5 min-w-[20px]" /> 
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>Feed</span>
                </Link>
                {currentUser && (
                  <>
                    <Link href="/bookmarks" className={`flex items-center gap-4 text-sm transition-colors ${pathname === '/bookmarks' ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                      <BookmarkIcon className="w-5 h-5 min-w-[20px]" /> 
                      <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>Saved</span>
                    </Link>
                    <Link href="/library" className={`flex items-center gap-4 text-sm transition-colors ${pathname === '/library' ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                      <Library className="w-5 h-5 min-w-[20px]" /> 
                      <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>My Library</span>
                    </Link>
                    <Link href={`/profile/${currentUser.username}`} className={`flex items-center gap-4 text-sm transition-colors ${pathname.startsWith('/profile') ? 'text-slate-900 dark:text-red-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400'}`}>
                      <UserCircle className="w-5 h-5 min-w-[20px]" /> 
                      <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>Profile</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="space-y-8 px-6 w-full overflow-hidden flex flex-col items-center lg:items-start">
              <button onClick={toggleTheme} className="flex items-center gap-4 text-sm text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-500 transition-colors w-full group whitespace-nowrap">
                <div className="min-w-[20px]">
                  {isMidnight ? <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />}
                </div>
                <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>{isMidnight ? 'Return to Light' : 'Enter Midnight'}</span>
              </button>

              {currentUser ? (
                <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-4 text-sm text-red-500 hover:text-red-700 dark:text-red-900 dark:hover:text-red-700 transition-colors w-full whitespace-nowrap">
                  <LogOut className="w-5 h-5 min-w-[20px]" /> 
                  <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>Logout</span>
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-4 text-sm text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400 transition-colors whitespace-nowrap">
                  <LogOut className="w-5 h-5 min-w-[20px]" /> 
                  <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden lg:block' : 'opacity-100'}`}>Login</span>
                </Link>
              )}
            </div>
          </aside>

          {/* Main Content Area adjusts based on sidebar state */}
          <main 
            className={`flex-1 relative min-h-screen transition-all duration-500 ease-in-out w-full
              ml-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
            `}
          >
            {/* Added an extra top pad for mobile so content isn't under the bookmark toggle */}
            <div className="pt-16 lg:pt-0">
              {children}
            </div>
          </main>

        </div>
      </div>
    </ThemeContext.Provider>
  );
}