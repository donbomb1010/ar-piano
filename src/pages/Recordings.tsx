import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Recordings() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <Mic className="text-red-500 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Recordings</h1>
        <p className="text-gray-400 mb-8">
          Your saved performances will appear here. The recording feature is currently in development and will be available in the next update.
        </p>
      </motion.div>
    </div>
  );
}
