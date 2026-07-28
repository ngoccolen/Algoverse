import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Compass, Code2, Trophy, Users, Map,
  Menu, X, ChevronRight, Zap, LogOut, User as UserIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setShowProfileMenu(false);
    navigate("/login");
  };

  const menuItems = [
    { id: '/learning-path', label: 'Lộ trình AI', icon: Map },
    { id: '/', label: 'Trang chủ', icon: Home },
    { id: '/explore', label: 'Khám phá', icon: Compass },
    { id: '/practice', label: 'Luyện tập', icon: Code2 },
    { id: '/contests', label: 'Cuộc thi', icon: Trophy },
    { id: '/community', label: 'Cộng đồng', icon: Users },
  ];
  
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-500/5' 
            : 'bg-slate-900/60 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Container chính */}
          <div className={`relative flex items-center justify-between ${isScrolled ? 'h-16' : 'h-20'}`}>

            {/* 1. LOGO */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer group z-10 shrink-0">
              <motion.div 
                className="relative"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur-sm opacity-75"></div>
                <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 p-1.5 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                Algoverse
              </span>
            </Link>

            <div className="hidden lg:flex items-center space-x-1 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.id;
                return (
                  <Link key={item.id} to={item.id}>
                    <motion.div
                      className="relative px-3 py-2 rounded-lg group cursor-pointer flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                      
                      <span className={`text-sm font-medium whitespace-nowrap ${active ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center space-x-4 z-10 shrink-0">
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-3 bg-slate-800/50 border border-white/10 rounded-full pl-1 pr-4 py-1 whitespace-nowrap"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-[1px] overflow-hidden">
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                        alt="User" 
                        className="w-full h-full rounded-full bg-slate-900 object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">
                      {user.username}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <Link to="/profile" className="flex items-center space-x-2 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors">
                          <UserIcon className="w-4 h-4" />
                          <span>Hồ sơ của tôi</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group overflow-hidden px-6 py-2.5 rounded-lg text-white whitespace-nowrap"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
                    <span className="relative flex items-center space-x-2">
                      <span>Đăng nhập</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800/50 z-10"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-300" /> : <Menu className="w-6 h-6 text-slate-300" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-slate-900/98 z-50 lg:hidden border-l border-white/10"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl font-bold text-white">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {user ? (
                  <div className="mb-8 p-4 bg-slate-800/50 rounded-xl flex items-center space-x-3">
                     <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} 
                        alt="User" 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.id}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                  {user ? (
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 py-3 rounded-lg hover:bg-red-500/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-lg font-medium">
                        Đăng nhập
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
