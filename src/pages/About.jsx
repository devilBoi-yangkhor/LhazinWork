import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaFilePdf,
  FaBrain,
  FaRocket,
  FaShieldAlt,
  FaCheckCircle,
  FaChartLine,
  FaUsers,
  FaStar,
  FaRobot,
  FaMagic,
  FaDatabase,
  FaCrown,
  FaInfinity,
  FaNodeJs,
  FaPython,
  FaClock,
  FaBook,
  FaGraduationCap,
  FaGlobe,
  FaLightbulb,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaArrowRight,
  FaCode,
  FaServer,
  FaCloud,
  FaLock,
  FaScroll,
  FaGem,
  FaAward,
  FaBullseye,
  FaEye,
  FaHeart,
  FaHandshake,
  FaQuoteLeft,
  FaQuoteRight,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { SiReact, SiVite, SiGoogle } from 'react-icons/si'
import { useNavigate } from 'react-router-dom'
import './About.css'

function About() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Team members data
  const teamMembers = [
    {
      name: "Karma Dorji",
      role: "Lead Developer",
      bio: "Full-stack developer passionate about AI and document processing",
      avatar: "KD",
      color: "#667eea"
    },
    {
      name: "Tashi Wangmo",
      role: "AI/ML Engineer",
      bio: "Specializes in NLP and large language model integration",
      avatar: "TW",
      color: "#4ECDC4"
    },
    {
      name: "Sonam Gyeltshen",
      role: "UI/UX Designer",
      bio: "Creates beautiful, intuitive interfaces for complex data",
      avatar: "SG",
      color: "#F9CA24"
    },
    {
      name: "Pema Choden",
      role: "Product Manager",
      bio: "Bridges technology and user needs with a human-centric approach",
      avatar: "PC",
      color: "#FF6B6B"
    }
  ]

  // Values data
  const values = [
    {
      icon: <FaEye size={24} />,
      title: "Transparency",
      description: "Open source and transparent AI processing"
    },
    {
      icon: <FaShieldAlt size={24} />,
      title: "Security",
      description: "Your documents are encrypted and secure"
    },
    {
      icon: <FaHeart size={24} />,
      title: "User First",
      description: "Designed with user experience in mind"
    },
    {
      icon: <FaHandshake size={24} />,
      title: "Trust",
      description: "Building trust through reliable AI responses"
    }
  ]

  // Tech stack data
  const techStack = [
    { name: "React", icon: <SiReact size={28} />, color: "#61DAFB" },
    { name: "Vite", icon: <SiVite size={28} />, color: "#646CFF" },
    { name: "Gemini AI", icon: <FaBrain size={28} />, color: "#4285F4" },
    { name: "Node.js", icon: <FaNodeJs size={28} />, color: "#339933" },
    { name: "Python", icon: <FaPython size={28} />, color: "#3776AB" },
    { name: "PDF.js", icon: <FaFilePdf size={28} />, color: "#FF6B6B" }
  ]

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="about-badge"
          >
            <FaGem size={16} className="badge-icon" />
            <span>About Lhazin's Work</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="about-title"
          >
            Transforming Documents into
            <span className="gradient-text"> Intelligent Insights</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="about-subtitle"
          >
            We're on a mission to make document analysis accessible to everyone. 
            Using cutting-edge AI technology, we help you extract meaningful 
            insights from your PDFs in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="about-actions"
          >
            <button className="btn-primary" onClick={() => navigate('/')}>
              <FaRocket size={20} />
              Get Started
              <FaArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              <FaFilePdf size={20} />
              Upload Your PDF
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="stat-icon"><FaFilePdf size={32} /></div>
            <div className="stat-number">10K+</div>
            <div className="stat-label">PDFs Processed</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="stat-icon"><FaRobot size={32} /></div>
            <div className="stat-number">50K+</div>
            <div className="stat-label">AI Queries Answered</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="stat-icon"><FaUsers size={32} /></div>
            <div className="stat-number">5K+</div>
            <div className="stat-label">Happy Users</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="stat-icon"><FaStar size={32} /></div>
            <div className="stat-number">4.9/5</div>
            <div className="stat-label">User Rating</div>
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="mission-section">
        <div className="section-header">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <FaBullseye size={16} />
            Our Mission
          </motion.span>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            What We <span className="gradient-text">Do</span>
          </motion.h2>
        </div>

        <div className="mission-grid">
          <motion.div
            className="mission-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mission-icon" style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
              <FaFilePdf size={32} />
            </div>
            <h3>PDF Analysis</h3>
            <p>Upload any PDF and our system extracts text, tables, and structured data instantly using advanced PDF parsing technology.</p>
          </motion.div>

          <motion.div
            className="mission-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="mission-icon" style={{ background: 'rgba(78, 205, 196, 0.1)', color: '#4ECDC4' }}>
              <FaBrain size={32} />
            </div>
            <h3>AI-Powered Q&A</h3>
            <p>Ask questions and get intelligent, context-aware answers from your documents powered by Google's Gemini AI.</p>
          </motion.div>

          <motion.div
            className="mission-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="mission-icon" style={{ background: 'rgba(249, 202, 36, 0.1)', color: '#F9CA24' }}>
              <FaChartLine size={32} />
            </div>
            <h3>Smart Reports</h3>
            <p>Generate comprehensive reports with visualizations, key insights, and actionable recommendations from your data.</p>
          </motion.div>

          <motion.div
            className="mission-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="mission-icon" style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B' }}>
              <FaShieldAlt size={32} />
            </div>
            <h3>Secure & Private</h3>
            <p>Your documents and data are encrypted and secure. We never store your files without your explicit permission.</p>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section">
        <div className="section-header">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <FaCode size={16} />
            Technology
          </motion.span>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Built with Modern <span className="gradient-text">Tech Stack</span>
          </motion.h2>
        </div>

        <div className="tech-grid">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              className="tech-item"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
            >
              <div className="tech-icon" style={{ color: tech.color }}>
                {tech.icon}
              </div>
              <span className="tech-name">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="section-header">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <FaAward size={16} />
            Our Values
          </motion.span>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            What Drives <span className="gradient-text">Us</span>
          </motion.h2>
        </div>

        <div className="values-grid">
          {values.map((value, index) => (
            <motion.div
              key={index}
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="value-icon" style={{ color: '#667eea' }}>
                {value.icon}
              </div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-header">
          <motion.span
            className="section-tag"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <FaUsers size={16} />
            The Team
          </motion.span>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Meet the <span className="gradient-text">Creators</span>
          </motion.h2>
        </div>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="team-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
            >
              <div className="team-avatar" style={{ background: member.color }}>
                {member.avatar}
              </div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
              <div className="team-social">
                <button className="social-btn"><FaGithub size={16} /></button>
                <button className="social-btn"><FaLinkedin size={16} /></button>
                <button className="social-btn"><FaTwitter size={16} /></button>
                <button className="social-btn"><FaEnvelope size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <motion.div
          className="testimonial-container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <FaQuoteLeft size={32} className="quote-icon" style={{ color: '#667eea', opacity: 0.3 }} />
          <div className="testimonial-content">
            <p className="testimonial-text">
              "This platform has completely transformed how I work with PDFs. 
              The AI-powered Q&A feature saves me hours of manual searching. 
              It's like having a research assistant that never sleeps."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: '#667eea' }}>
                JD
              </div>
              <div>
                <div className="author-name">Jigme Dorji</div>
                <div className="author-role">Researcher, Thimphu</div>
              </div>
              <div className="author-stars">
                <FaStar size={16} color="#F9CA24" />
                <FaStar size={16} color="#F9CA24" />
                <FaStar size={16} color="#F9CA24" />
                <FaStar size={16} color="#F9CA24" />
                <FaStar size={16} color="#F9CA24" />
              </div>
            </div>
          </div>
          <FaQuoteRight size={32} className="quote-icon" style={{ color: '#667eea', opacity: 0.3, alignSelf: 'flex-end' }} />
        </motion.div>
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
              Ready to Transform Your{' '}
              <span className="gradient-text">Document Workflow?</span>
            </h2>
            <p className="cta-subtitle">
              Join thousands of users who are already using Lhazin's Work to analyze,
              understand, and extract insights from their PDFs.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary cta-btn" onClick={() => navigate('/')}>
                <FaRocket size={20} />
                Get Started Now
                <FaArrowRight size={16} />
              </button>
              <button className="btn-secondary cta-btn-secondary" onClick={() => navigate('/')}>
                <FaFilePdf size={20} />
                Upload Your PDF
              </button>
            </div>
            <div className="cta-features">
              <span><FaCheckCircle size={16} /> No credit card</span>
              <span><FaCrown size={16} /> Free forever plan</span>
              <span><FaInfinity size={16} /> Unlimited documents</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">
              <FaFilePdf size={24} style={{ color: '#FF6B6B', marginRight: '8px' }} />
              Lhazin's Work
            </h3>
            <p className="footer-description">
              AI-powered PDF analysis and document intelligence.
            </p>
            <div className="footer-social">
              <button className="footer-social-btn"><FaGithub size={20} /></button>
              <button className="footer-social-btn"><FaLinkedin size={20} /></button>
              <button className="footer-social-btn"><FaTwitter size={20} /></button>
              <button className="footer-social-btn"><FaEnvelope size={20} /></button>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-links-group">
              <h4>Product</h4>
              <a href="/">Features</a>
              <a href="/">Pricing</a>
              <a href="/">Docs</a>
            </div>
            <div className="footer-links-group">
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/">Blog</a>
              <a href="/">Careers</a>
            </div>
            <div className="footer-links-group">
              <h4>Support</h4>
              <a href="/">Help Center</a>
              <a href="/">Contact</a>
              <a href="/">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Lhazin's Work. Built with ❤️ in Bhutan.</p>
          <div className="footer-bottom-links">
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default About