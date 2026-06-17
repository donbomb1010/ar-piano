import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen relative w-full h-full">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-electric-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel p-10 text-center max-w-2xl mx-4 z-10"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-7xl font-extrabold text-gradient mb-6 tracking-tight">
            Air Piano AI
          </h1>
        </motion.div>
        
        <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
          Transform any flat surface into a musical instrument. Point your camera, move your fingers, and play a virtual piano without touching the screen.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-electric-blue text-black font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:shadow-[0_0_30px_rgba(0,210,255,0.6)] transition-shadow w-full sm:w-auto justify-center text-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Playing
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-full backdrop-blur-md transition-colors w-full sm:w-auto justify-center text-lg"
          >
            Watch Demo
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
