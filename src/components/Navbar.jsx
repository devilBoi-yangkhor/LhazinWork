import { Link } from 'react-router-dom'
import './Navbar.css'
import logo from '../assets/logo.png'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img 
            src={logo} 
            alt="Logo" 
            className="nav-logo-image"
          />
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">About</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar