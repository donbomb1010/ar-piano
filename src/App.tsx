import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Settings from './pages/Settings';
import AirPiano from './pages/AirPiano';
import Learn from './pages/Learn';
import Recordings from './pages/Recordings';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-grow flex flex-col relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<AirPiano />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
