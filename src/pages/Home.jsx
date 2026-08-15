import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FaFilePdf, 
  FaChartBar, 
  FaBrain, 
  FaRocket, 
  FaStar,
  FaRobot,
  FaMagic,
  FaDatabase,
  FaCrown,
  FaInfinity,
  FaNodeJs,
  FaPython,
  FaPlus,
  FaClock,
  FaBook,
  FaGraduationCap,
  FaGlobe,
  FaLightbulb,
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa'
import { 
  SiReact, 
  SiVite
} from 'react-icons/si'
import { useNavigate } from 'react-router-dom'
import './Home.css'

// CORRECT IMPORT - adjust path based on where your image is
import watermarkLogo from '../assets/logo.png' // If in src/assets/
// OR
// import watermarkLogo from './logo.png' // If in src/pages/
// OR
// const watermarkLogo = '/logo.png' // If in public folder

function Home() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Featured Notebooks Data
  const featuredNotebooks = [
    {
      title: "U.S. National Archives with Google",
      description: "Exploring historical documents and archives",
      date: "17 Apr 2026",
      sources: "44 sources",
      icon: <FaBook size={24} />,
      color: "#667eea"
    },
    {
      title: "Revolutionary Blueprints: The Future of Tech",
      description: "Understanding emerging technologies",
      date: "17 Apr 2026",
      sources: "44 sources",
      icon: <FaGraduationCap size={24} />,
      color: "#4ECDC4"
    },
    {
      title: "Techno Sapiens: Parenting Advice for the Digital Age",
      description: "Modern parenting in the digital era",
      date: "6 May 2025",
      sources: "21 sources",
      icon: <FaLightbulb size={24} />,
      color: "#F9CA24"
    },
    {
      title: "Google Research: How Can Scientists Know What's in Your...",
      description: "Scientific research and data analysis",
      date: "10 Jul 2025",
      sources: "36 sources",
      icon: <FaGlobe size={24} />,
      color: "#FF6B6B"
    },
    {
      title: "Travel: The Science Fan's Guide To Visiting...",
      description: "Science travel destinations",
      date: "12 May 2025",
      sources: "17 sources",
      icon: <FaRocket size={24} />,
      color: "#45B7D1"
    }
  ]

  // Features data
  const features = [
    {
      icon: <FaFilePdf size={28} />,
      title: "PDF Upload & Parse",
      description: "Upload any PDF and extract text, tables, and structured data instantly.",
      color: "#FF6B6B"
    },
    {
      icon: <FaBrain size={28} />,
      title: "AI-Powered Q&A",
      description: "Ask questions and get intelligent answers from your documents.",
      color: "#4ECDC4"
    },
    {
      icon: <FaChartBar size={28} />,
      title: "Smart Report Generation",
      description: "Generate reports with beautiful charts and visualizations.",
      color: "#45B7D1"
    }
  ]

  // Filter tabs
  const filters = ["All", "Featured notebooks", "Collections"]

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Please upload a valid PDF file')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  useEffect(() => {
    document.title = 'AI Assistant - Upload & Analyze PDFs'
  }, [])

  const handleDragOver = (event) => {
    event.preventDefault()
    event.currentTarget.style.borderColor = '#667eea'
    event.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.currentTarget.style.borderColor = '#ddd'
    event.currentTarget.style.background = 'white'
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.currentTarget.style.borderColor = '#ddd'
    event.currentTarget.style.background = 'white'
    
    const file = event.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Please upload a valid PDF file')
    }
  }

  const handleGenerateReport = () => {
    if (!selectedFile) {
      alert('Please select a PDF file first!')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          navigate('/report', { 
            state: { 
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
              fileType: selectedFile.type,
              file: selectedFile
            } 
          })
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="home-container">
      {/* Watermark Background */}
      <div className="watermark-container">
        <img 
          src={watermarkLogo} 
          alt="Watermark" 
          className="watermark-image"
        />
      </div>

      {/* Hero Section - Full Width */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-badge"
          >
            <FaStar size={16} className="badge-icon" />
            <span>AI Assistant Knowledge Retrival</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            Transform Your PDFs into
            <span className="gradient-text"> Intelligent Insights</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-subtitle"
          >
            Upload, analyze, and extract insights from your PDFs with AI-powered technology.
            Get answers, generate reports, and visualize data in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-actions"
          >
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
              <FaFilePdf size={20} />
              Upload Your PDF
              <FaArrowRight size={16} />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf" 
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </motion.div>

          {/* File Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="upload-container"
          >
            <div 
              className={`upload-area ${selectedFile ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <div className="upload-placeholder">
                  <div className="upload-icon-wrapper">
                    <FaUpload size={40} className="upload-icon" />
                  </div>
                  <h3 className="upload-title">Drop your PDF here</h3>
                  <p className="upload-subtitle">or click to browse files</p>
                  <div className="upload-formats">
                    <span><FaFilePdf size={14} /> PDF only</span>
                    <span>·</span>
                    <span>Max size: 50MB</span>
                  </div>
                  <button 
                    className="upload-browse-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="upload-file-info">
                  <div className="file-preview">
                    <FaFilePdf size={48} className="file-icon" />
                    <div className="file-details">
                      <h4 className="file-name">{selectedFile.name}</h4>
                      <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button className="file-remove" onClick={removeFile}>
                      <FaTimes size={20} />
                    </button>
                  </div>
                  
                  {isUploading ? (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="progress-text">{uploadProgress}% Uploading...</p>
                    </div>
                  ) : (
                    <button 
                      className="generate-report-btn"
                      onClick={handleGenerateReport}
                    >
                      <FaRocket size={18} />
                      Generate Report
                      <FaArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Tech Stack Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="tech-stack"
          >
            <p className="tech-label">Built with modern tech:</p>
            <div className="tech-icons">
              <span className="tech-pill"><SiReact size={20} /> React</span>
              <span className="tech-pill"><SiVite size={20} /> Vite</span>
              <span className="tech-pill"><FaNodeJs size={20} /> Node.js</span>
              <span className="tech-pill"><FaPython size={20} /> Python</span>
              <span className="tech-pill"><FaBrain size={20} /> AI/ML</span>
              <span className="tech-pill"><FaRobot size={20} /> OpenAI</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="section-tag">
            <FaMagic size={16} />
            Features
          </span>
          <h2 className="section-title">
            Everything You Need for{' '}
            <span className="gradient-text">Document Intelligence</span>
          </h2>
          <p className="section-subtitle">
            Powerful features that make PDF analysis, Q&A, and reporting effortless
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)"
              }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-link">
                Learn More <FaArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Revolutionize Your{' '}
              <span className="gradient-text">Document Workflow?</span>
            </h2>
            <p className="cta-subtitle">
              Join thousands of users who are already using DocAI to analyze,
              understand, and extract insights from their PDFs.
            </p>
            
            <div className="cta-features">
              <span><FaCheckCircle size={16} /> No credit card</span>
              <span><FaCrown size={16} /> Free forever plan</span>
              <span><FaInfinity size={16} /> Unlimited documents</span>
            </div>
          </div>
          <div className="cta-graphic">
            <div className="floating-docs">
              <motion.div
                className="doc doc-1"
                animate={{ y: [0, -30, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaFilePdf size={48} />
                <span>PDF</span>
              </motion.div>
              <motion.div
                className="doc doc-2"
                animate={{ y: [0, 30, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <FaChartBar size={48} />
                <span>Reports</span>
              </motion.div>
              <motion.div
                className="doc doc-3"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <FaBrain size={48} />
                <span>AI</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Home