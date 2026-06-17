import { NavLink } from 'react-router-dom';
import { Home, Music, BookOpen, Mic, Settings, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', name: 'Home', icon: Home },
  { path: '/play', name: 'Air Piano', icon: Music },
  { path: '/learn', name: 'Learn Songs', icon: BookOpen },
  { path: '/recordings', name: 'Recordings', icon: Mic },
  { path: '/settings', name: 'Settings', icon: Settings },
  { path: '/about', name: 'About', icon: Info },
];

export default function Sidebar() {
  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full md:w-64 glass-panel md:h-screen md:sticky top-0 z-50 flex flex-col md:rounded-none md:border-y-0 md:border-l-0"
    >
      <div className="p-6 flex items-center justify-center md:justify-start gap-3 border-b border-glass-border">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.5)]">
          <Music className="text-black w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-wider hidden md:block">AIR PIANO</h2>
      </div>

      <nav className="flex-1 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible items-center md:items-stretch">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 min-w-max md:min-w-0 ${
                isActive
                  ? 'bg-electric-blue/20 text-electric-blue shadow-[inset_0_0_10px_rgba(0,210,255,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium hidden md:block">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 hidden md:block">
        <div className="bg-dark-surface/50 rounded-xl p-4 text-xs text-gray-500 text-center">
          <p>AI Engine Loading...</p>
        </div>
      </div>
    </motion.div>
  );
}
