import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto glass-panel p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-electric-blue/20 flex items-center justify-center mb-6">
          <Info className="text-electric-blue w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-4">About Air Piano AI</h1>
        <p className="text-gray-400 mb-6">
          Air Piano AI uses advanced computer vision powered by MediaPipe to track your hand movements in real-time. 
          By mapping your fingertips to a virtual keyboard space, you can play a piano anywhere without touching a physical instrument.
        </p>
        <p className="text-sm text-gray-500">
          Version 1.0.0 &copy; {new Date().getFullYear()} Air Piano AI. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
