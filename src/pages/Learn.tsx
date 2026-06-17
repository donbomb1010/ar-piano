import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Learn() {
  const songs = [
    { title: 'Twinkle Twinkle Little Star', difficulty: 'Beginner', progress: 100 },
    { title: 'Ode to Joy', difficulty: 'Beginner', progress: 50 },
    { title: 'Für Elise', difficulty: 'Intermediate', progress: 0 },
    { title: 'River Flows in You', difficulty: 'Advanced', progress: 0 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BookOpen className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Learn Songs</h1>
            <p className="text-gray-400">Master the Air Piano with interactive lessons</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {songs.map((song, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="glass-panel p-6 cursor-pointer hover:border-electric-blue/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{song.title}</h3>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  song.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                  song.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {song.difficulty}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Progress</span>
                  <span>{song.progress}%</span>
                </div>
                <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-electric-blue" 
                    style={{ width: `${song.progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
