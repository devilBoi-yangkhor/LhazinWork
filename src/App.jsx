import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Report from './pages/Report'  // ← ADD THIS
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/report" element={<Report />} />  {/* ← ADD THIS */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App