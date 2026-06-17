import { motion } from 'framer-motion';
import { Volume2, Hand, Settings2, Moon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      {/* Background decoration */}
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Configure your Air Piano AI experience</p>
        </div>

        <div className="space-y-6">
          {/* Audio Settings */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-glass-border pb-4">
              <Volume2 className="text-electric-blue w-6 h-6" />
              <h2 className="text-xl font-semibold">Audio</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Master Volume</p>
                  <p className="text-sm text-gray-400">Adjust the overall output volume</p>
                </div>
                <input type="range" className="w-32 md:w-48 accent-electric-blue" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Piano Sound Pack</p>
                  <p className="text-sm text-gray-400">Select instrument samples</p>
                </div>
                <select className="bg-dark-surface border border-glass-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-electric-blue">
                  <option>Grand Piano</option>
                  <option>Electric Piano</option>
                  <option>Synthesizer</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Hand Tracking Settings */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-glass-border pb-4">
              <Hand className="text-electric-blue w-6 h-6" />
              <h2 className="text-xl font-semibold">Hand Tracking</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Trigger Sensitivity</p>
                  <p className="text-sm text-gray-400">How deep fingers need to go to trigger a note</p>
                </div>
                <input type="range" className="w-32 md:w-48 accent-electric-blue" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">AI Confidence Threshold</p>
                  <p className="text-sm text-gray-400">Lower values may cause false positives</p>
                </div>
                <input type="range" className="w-32 md:w-48 accent-electric-blue" />
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-glass-border pb-4">
              <Settings2 className="text-electric-blue w-6 h-6" />
              <h2 className="text-xl font-semibold">Appearance & General</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-gray-400">Dark mode is recommended</p>
                </div>
                <div className="flex items-center gap-2 bg-dark-surface rounded-lg p-1">
                  <button className="p-2 rounded-md bg-electric-blue/20 text-electric-blue"><Moon className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
