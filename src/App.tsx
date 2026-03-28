import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Languages, LogOut, User, ShoppingBag, Truck, Settings, Menu, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './i18n';
import { cn } from './lib/utils';

// --- Contexts ---
interface AuthContextType {
  user: any | null;
  loading: boolean;
  isLoggingIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

import BookingPage from './pages/BookingPage';
import OrdersPage from './pages/OrdersPage';
import TrackingPage from './pages/TrackingPage';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';

// --- Components ---
const Navbar = ({ toggleDarkMode, isDarkMode }: { toggleDarkMode: () => void, isDarkMode: boolean }) => {
  const { user, login, logout, isLoggingIn } = useAuth();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">JB</div>
              <span className="text-xl font-bold text-zinc-900 dark:text-white hidden sm:block">{t('app_name')}</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleLang} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages className="w-5 h-5" />
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm font-medium hover:text-orange-600 transition-colors">Dashboard</Link>
                <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-zinc-200" />
              </div>
            ) : (
              <button 
                onClick={login} 
                disabled={isLoggingIn}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('login')}
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Home</Link>
              {user && <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Dashboard</Link>}
              <button onClick={toggleLang} className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2">
                <Languages className="w-5 h-5" /> {i18n.language === 'en' ? 'Hindi' : 'English'}
              </button>
              <button onClick={toggleDarkMode} className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} Theme
              </button>
              {user ? (
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2">
                  <LogOut className="w-5 h-5" /> {t('logout')}
                </button>
              ) : (
                <button 
                  onClick={login} 
                  disabled={isLoggingIn}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-orange-600 text-white mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoggingIn && <Loader2 className="w-5 h-5 animate-spin" />}
                  {t('login')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---
const Home = () => {
  const { t } = useTranslation();
  const { login, user, isLoggingIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 dark:text-white mb-6 tracking-tight">
          {t('welcome')}
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
          {t('tagline')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link to="/dashboard" className="bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg shadow-orange-600/20">
              Go to Dashboard
            </Link>
          ) : (
            <button 
              onClick={login} 
              disabled={isLoggingIn}
              className="bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoggingIn && <Loader2 className="w-6 h-6 animate-spin" />}
              {t('login')} to Start
            </button>
          )}
          <Link to="/dashboard/orders" className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">
            {t('track_order')}
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full">
        {[
          { icon: <ShoppingBag className="w-8 h-8 text-orange-600" />, title: "Easy Booking", desc: "Select your grain and quantity in seconds." },
          { icon: <Truck className="w-8 h-8 text-orange-600" />, title: "Doorstep Delivery", desc: "We pick up and deliver at your convenience." },
          { icon: <Settings className="w-8 h-8 text-orange-600" />, title: "Real-time Tracking", desc: "Watch your grain being processed live." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  if (!user) return <Navigate to="/" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t('hi')}, {user.displayName}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage your orders and profile here.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-2">
          <nav className="flex flex-col gap-1 sticky top-24">
            <Link to="/dashboard" className="px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium">Overview</Link>
            <Link to="/dashboard/book" className="px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium">Book Service</Link>
            <Link to="/dashboard/orders" className="px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium">My Orders</Link>
            {user.role === 'admin' && <Link to="/admin" className="px-4 py-2 rounded-lg text-orange-600 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Admin Panel</Link>}
            {user.role === 'delivery' && <Link to="/delivery" className="px-4 py-2 rounded-lg text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Delivery Panel</Link>}
          </nav>
        </aside>

        <main className="md:col-span-3">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link to="/dashboard/book" className="p-8 bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-600/20 hover:scale-[1.02] transition-transform">
                  <ShoppingBag className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t('book_now')}</h3>
                  <p className="text-orange-100 text-sm">Schedule a pickup for your grain.</p>
                </Link>
                <Link to="/dashboard/orders" className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:scale-[1.02] transition-transform">
                  <Truck className="w-10 h-10 mb-4 text-orange-600" />
                  <h3 className="text-xl font-bold mb-2">{t('track_order')}</h3>
                  <p className="text-zinc-500 text-sm">Check the status of your active orders.</p>
                </Link>
              </div>
            } />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/track/:orderId" element={<TrackingPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// --- App Root ---
export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            // New user, default to customer
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            setUser({ ...firebaseUser, ...userData });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setIsLoggingIn(false); // Reset logging in state on auth state change
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Login popup request was cancelled, likely due to multiple clicks.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.warn("Login popup was closed by the user.");
      } else {
        console.error("Login failed", error);
      }
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isLoggingIn, login, logout }}>
      <Router>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
          <Navbar toggleDarkMode={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/delivery/*" element={<DeliveryDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
