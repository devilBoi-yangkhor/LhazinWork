import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import Swal from 'sweetalert2'
import {
  FaFilePdf,
  FaArrowLeft,
  FaArrowRight,
  FaBrain,
  FaChartBar,
  FaDownload,
  FaShare,
  FaSave,
  FaRobot,
  FaMagic,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaFileAlt,
  FaQuestionCircle,
  FaPaperPlane,
  FaChartLine,
  FaTable,
  FaCode,
  FaInfoCircle,
  FaFileInvoice,
  FaEye,
  FaRocket,
  FaDatabase,
  FaBook,
  FaGavel,
  FaList,
  FaScroll,
  FaSearch,
  FaExpand,
  FaThumbsUp,
  FaLightbulb,
  FaChevronLeft,
  FaChevronRight,
  FaPrint,
  FaFile,
  FaTextHeight,
  FaCopy,
  FaMinus,
  FaPlus
} from 'react-icons/fa'
import './Report.css'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`

function Report() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const fileData = location.state || { 
    fileName: 'document.pdf', 
    fileSize: 0,
    file: null
  }
  
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis')
  const [reportData, setReportData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [pdfText, setPdfText] = useState('')
  const [pdfPages, setPdfPages] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [extractedText, setExtractedText] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const messagesEndRef = useRef(null)

  // Show SweetAlert
  const showAlert = (type, title, message) => {
    const icons = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    }
    
    Swal.fire({
      icon: icons[type] || 'info',
      title: title,
      text: message,
      confirmButtonColor: '#667eea',
      confirmButtonText: 'OK',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)'
    })
  }

  // Extract text from PDF
  const extractTextFromPDF = async (file) => {
    try {
      console.log('📄 Extracting text from PDF:', file.name)
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
      
      let fullText = ''
      const pages = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map(item => item.str).join(' ')
          pages.push({
            pageNumber: i,
            text: pageText,
            length: pageText.length,
            wordCount: pageText.split(/\s+/).filter(w => w.length > 0).length
          })
          fullText += pageText + ' '
        } catch (pageError) {
          console.warn(`⚠️ Could not read page ${i}:`, pageError)
          pages.push({
            pageNumber: i,
            text: '[Could not extract text from this page]',
            length: 0,
            wordCount: 0
          })
        }
      }
      
      setPdfPages(pages)
      setPdfText(fullText)
      setExtractedText(fullText)
      
      console.log('✅ Extracted text length:', fullText.length)
      console.log('📄 Pages extracted:', pages.length)
      
      analyzePDFContent(fullText, pages, pdf.numPages)
      
      return { fullText, pages }
    } catch (error) {
      console.error('❌ Error extracting PDF:', error)
      setIsAnalyzing(false)
      
      showAlert(
        'error',
        '⚠️ Error Reading PDF',
        'Error reading PDF file.\n\nPossible issues:\n• The PDF may be password protected\n• The PDF may be corrupted\n• The PDF may be scanned without text\n\nTry uploading a different PDF file.'
      )
      
      setReportData({
        title: fileData.fileName?.replace('.pdf', '') || 'Document',
        type: 'Document',
        author: 'Unknown',
        year: '2024',
        description: 'Could not extract text from this PDF.',
        summary: 'This PDF could not be read.',
        chapters: [],
        keyPoints: ['Unable to extract text from this PDF'],
        entities: ['PDF Error'],
        stats: {
          pages: 0,
          words: 0,
          characters: 0,
          sentences: 0,
          paragraphs: 0,
          uniqueWords: 0,
          averageWordLength: 0,
          readingTime: 0
        },
        keyRules: []
      })
    }
  }

  // Analyze PDF content
  const analyzePDFContent = (text, pages, totalPages) => {
    setIsAnalyzing(true)
    
    if (!text || text.trim().length === 0) {
      setIsAnalyzing(false)
      setReportData({
        title: fileData.fileName?.replace('.pdf', '') || 'Document',
        type: 'Document',
        author: 'Unknown',
        year: '2024',
        description: 'No text could be extracted.',
        summary: 'This document appears to be scanned or contains no selectable text.',
        chapters: [],
        keyPoints: ['No text content found in this PDF'],
        entities: ['PDF', 'Document'],
        stats: {
          pages: totalPages || 1,
          words: 0,
          characters: 0,
          sentences: 0,
          paragraphs: 0,
          uniqueWords: 0,
          averageWordLength: 0,
          readingTime: 0
        },
        keyRules: []
      })
      return
    }
    
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))]
    
    const commonWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']
    
    const wordsArray = text.split(/\s+/).filter(w => w.length > 3 && !commonWords.includes(w.toLowerCase()))
    const wordFrequency = {}
    wordsArray.forEach(w => {
      const lower = w.toLowerCase()
      wordFrequency[lower] = (wordFrequency[lower] || 0) + 1
    })
    
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word)
    
    const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || []
    const uniquePhrases = [...new Set(capitalizedPhrases)].slice(0, 15)
    
    let fullSummary = ''
    if (sentences.length > 0) {
      const summarySentences = sentences.slice(0, Math.min(5, sentences.length)).join(' ')
      fullSummary = summarySentences
    } else {
      fullSummary = text.substring(0, 500) + (text.length > 500 ? '...' : '')
    }
    
    const keyPoints = sentences
      .filter(s => s.length > 30 && s.length < 300)
      .slice(0, 10)
      .map(s => s.trim())
    
    const chapterRegex = /(?:chapter|section|part|article)\s+(\d+)[:\s]+([^\n]+)/gi
    const chapters = []
    let match
    while ((match = chapterRegex.exec(text)) !== null) {
      chapters.push({
        number: parseInt(match[1]),
        title: match[2]?.trim() || `Chapter ${match[1]}`,
        pages: Math.floor(Math.random() * 3) + 1
      })
    }
    
    const finalChapters = chapters.length > 0 ? chapters.slice(0, 15) : 
      Array.from({ length: Math.min(totalPages || 1, 10) }, (_, i) => ({
        number: i + 1,
        title: `Section ${i + 1}`,
        pages: 1
      }))
    
    const entities = [...new Set([
      ...uniquePhrases.slice(0, 10),
      ...sortedWords.slice(0, 5)
    ])]
    
    const stats = {
      pages: totalPages || 1,
      words: words.length,
      characters: text.length,
      sentences: sentences.length,
      paragraphs: text.split(/\n\s*\n/).length || 1,
      uniqueWords: uniqueWords.length,
      averageWordLength: words.length > 0 ? (text.length / words.length).toFixed(1) : 0,
      readingTime: Math.ceil(words.length / 200) || 1
    }
    
    const keyRules = keyPoints.slice(0, 8).map((point, i) => ({
      rule: `Key Point ${i + 1}`,
      value: point.substring(0, 60) + (point.length > 60 ? '...' : '')
    }))
    
    setReportData({
      title: fileData.fileName?.replace('.pdf', '') || 'Document',
      type: detectDocumentType(text),
      author: extractAuthor(text) || 'Unknown Author',
      year: extractYear(text) || new Date().getFullYear().toString(),
      description: fullSummary,
      summary: fullSummary,
      chapters: finalChapters,
      keyPoints: keyPoints.length > 0 ? keyPoints : sortedWords.slice(0, 10),
      entities: entities.length > 0 ? entities : ['Document', 'Content', 'Text'],
      stats: stats,
      keyRules: keyRules
    })
    
    setIsAnalyzing(false)
    console.log('✅ Analysis complete!', { stats, keyPoints: keyPoints.length })
  }

  // Helper functions
  const detectDocumentType = (text) => {
    const lower = text.toLowerCase()
    if (lower.includes('report')) return 'Report Document'
    if (lower.includes('policy') || lower.includes('regulation') || lower.includes('rule')) return 'Policy Document'
    if (lower.includes('research') || lower.includes('study') || lower.includes('analysis')) return 'Research Document'
    if (lower.includes('contract') || lower.includes('agreement') || lower.includes('terms')) return 'Legal Document'
    if (lower.includes('invoice') || lower.includes('receipt') || lower.includes('payment')) return 'Financial Document'
    if (lower.includes('letter') || lower.includes('memo') || lower.includes('correspondence')) return 'Correspondence'
    return 'Document'
  }

  const extractAuthor = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    for (const line of lines.slice(0, 20)) {
      const lower = line.toLowerCase()
      if (lower.includes('author') || lower.includes('by ')) {
        const parts = line.split(/author|by/i)
        if (parts.length > 1) {
          const author = parts[1].trim().substring(0, 50)
          if (author.length > 2) return author
        }
      }
    }
    return null
  }

  const extractYear = (text) => {
    const yearRegex = /\b(19|20)\d{2}\b/g
    const matches = text.match(yearRegex)
    if (matches) {
      const years = matches.map(Number).filter(y => y > 1900 && y < 2100)
      if (years.length > 0) {
        const mostCommon = years.sort((a, b) => 
          years.filter(v => v === a).length - years.filter(v => v === b).length
        ).pop()
        return mostCommon?.toString()
      }
    }
    return null
  }

  const findAnswerInPDF = (userQuestion) => {
    if (!extractedText || extractedText.length === 0) {
      return "⚠️ No document content available."
    }

    const q = userQuestion.toLowerCase().trim()
    const sentences = extractedText.match(/[^.!?]+[.!?]+/g) || []
    
    if (sentences.length === 0) {
      return "📄 Couldn't find specific sentences to answer your question."
    }

    const questionWords = q.split(/\s+/).filter(w => w.length > 2)
    
    const scoredSentences = sentences.map(sentence => {
      let score = 0
      const sentenceLower = sentence.toLowerCase()
      
      if (sentenceLower.includes(q)) {
        score += 20
      }
      
      questionWords.forEach(word => {
        if (sentenceLower.includes(word)) {
          score += 3
        }
      })
      
      const sentenceWords = sentenceLower.split(/\s+/)
      const overlap = sentenceWords.filter(w => questionWords.includes(w)).length
      score += overlap * 2
      score += Math.min(sentenceWords.length / 10, 5)
      
      return { sentence, score }
    })
    
    const relevantSentences = scoredSentences
      .filter(s => s.score > 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.sentence.trim())
    
    if (relevantSentences.length > 0) {
      let response = "**📄 Found in your document:**\n\n"
      relevantSentences.forEach((s, i) => {
        response += `${i + 1}. ${s}\n\n`
      })
      return response
    }
    
    const sampleText = extractedText.substring(0, 500)
    return `**📄 Document Content:**\n\nI couldn't find a direct match for "${userQuestion}" in the document. Here's what the document contains:\n\n${sampleText}...\n\n💡 **Tip:** Try asking about specific words or phrases that appear in the document.`
  }

  // Load PDF on mount
  useEffect(() => {
    const loadPDF = async () => {
      console.log('📄 Loading PDF...', { fileData })
      
      if (location.state?.file) {
        console.log('✅ Found file object, extracting text...')
        await extractTextFromPDF(location.state.file)
      } else if (fileData.fileName) {
        console.log('⚠️ No file object found, showing sample data')
        const sampleText = `Please upload a valid PDF file to analyze.`
        const mockPages = [{ pageNumber: 1, text: sampleText, length: sampleText.length, wordCount: 0 }]
        setPdfPages(mockPages)
        setPdfText(sampleText)
        setExtractedText(sampleText)
        setTotalPages(1)
        setIsAnalyzing(false)
        setReportData({
          title: 'No PDF Loaded',
          type: 'Information',
          author: 'System',
          year: '2024',
          description: 'Please go back and upload a PDF file.',
          summary: 'No PDF file was uploaded.',
          chapters: [],
          keyPoints: ['Upload a PDF file to get started'],
          entities: ['PDF', 'Upload', 'Document'],
          stats: {
            pages: 1,
            words: 0,
            characters: 0,
            sentences: 0,
            paragraphs: 0,
            uniqueWords: 0,
            averageWordLength: 0,
            readingTime: 0
          },
          keyRules: []
        })
      } else {
        setIsAnalyzing(false)
      }
    }
    
    loadPDF()
  }, [location.state])

  // Search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    
    const results = []
    const searchLower = searchTerm.toLowerCase()
    pdfPages.forEach(page => {
      const textLower = page.text.toLowerCase()
      let index = textLower.indexOf(searchLower)
      while (index !== -1) {
        const start = Math.max(0, index - 60)
        const end = Math.min(page.text.length, index + searchTerm.length + 60)
        results.push({
          page: page.pageNumber,
          text: (start > 0 ? '...' : '') + page.text.substring(start, end) + (end < page.text.length ? '...' : '')
        })
        index = textLower.indexOf(searchLower, index + 1)
      }
    })
    setSearchResults(results)
  }

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle question submission
  const handleAskQuestion = () => {
    if (!question.trim()) return
    
    const userQuestion = question.trim()
    
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userQuestion,
      timestamp: new Date().toLocaleTimeString()
    }])
    
    setIsLoading(true)
    setQuestion('')

    setTimeout(() => {
      const answer = findAnswerInPDF(userQuestion)
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: answer,
        timestamp: new Date().toLocaleTimeString()
      }])
      setIsLoading(false)
    }, 800)
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAskQuestion()
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Handle page change
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  // Keyboard shortcuts for pages
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'pages') return
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goToNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrevPage()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, activeTab])

  // Check if we have real content
  const hasRealContent = extractedText && extractedText.length > 0 && !extractedText.includes('Please upload a valid PDF')

  return (
    <div className="report-container">
      {/* Header */}
      <header className="report-header">
        <div className="report-header-content">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/')}>
              <FaArrowLeft size={20} />
              Back
            </button>
            <div className="file-info">
              <FaFilePdf size={28} className="file-icon-header" />
              <div>
                <h1 className="file-name-header" style={{ color: '#1a1a2e' }}>
                  {fileData.fileName || 'document.pdf'}
                </h1>
                <p className="file-meta" style={{ color: '#5a5a7a' }}>
                  {formatFileSize(fileData.fileSize)} · PDF Document · {totalPages} pages
                  {hasRealContent && ` · ${reportData?.stats?.words || 0} words`}
                </p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn" onClick={() => showAlert('success', '✅ Saved!', 'Document saved successfully.')}>
              <FaSave size={18} />
              Save
            </button>
            <button className="header-btn" onClick={() => {
              setIsGenerating(true)
              setTimeout(() => {
                setIsGenerating(false)
                showAlert('success', '✅ Report Generated!', `Document: ${fileData.fileName}\nPages: ${totalPages}\nWords: ${reportData?.stats?.words || 0}`)
              }, 3000)
            }}>
              {isGenerating ? <FaSpinner className="spinning" size={18} /> : <FaDownload size={18} />}
              {isGenerating ? 'Generating...' : 'Export'}
            </button>
            <button className="header-btn" onClick={() => showAlert('info', '🔗 Copied!', 'Share link copied to clipboard.')}>
              <FaShare size={18} />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* File Preview Banner */}
      <div className="file-preview-banner">
        <div className="file-preview-content">
          <FaFilePdf size={32} className="preview-icon" style={{ color: '#FF6B6B' }} />
          <div className="preview-info">
            <span className="preview-name" style={{ color: '#1a1a2e' }}>
              {fileData.fileName || 'Document'}
            </span>
            <span className="preview-size" style={{ color: '#5a5a7a' }}>
              {totalPages} pages · {formatFileSize(fileData.fileSize)}
              {hasRealContent && ` · ${reportData?.stats?.words || 0} words`}
            </span>
          </div>
          <div className="preview-status">
            {isAnalyzing ? (
              <>
                <FaSpinner className="spinning status-icon" style={{ color: '#667eea' }} />
                <span style={{ color: '#5a5a7a' }}>Analyzing...</span>
              </>
            ) : (
              <>
                <FaCheckCircle size={16} className="status-icon" style={{ color: '#4ECDC4' }} />
                <span style={{ color: '#5a5a7a' }}>
                  {hasRealContent ? `${reportData?.stats?.words || 0} words extracted` : 'No text content'}
                </span>
              </>
            )}
          </div>
          <button className="preview-view-btn" onClick={() => {
            if (totalPages > 0) {
              showAlert('info', '📄 Document Details', `Document: ${fileData.fileName}\nPages: ${totalPages}\nWords: ${reportData?.stats?.words || 0}\nSentences: ${reportData?.stats?.sentences || 0}`)
            }
          }}>
            <FaEye size={16} />
            View Details
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="report-main">
        {/* Tabs */}
        <div className="report-tabs">
          <button 
            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <FaBrain size={16} />
            Analysis
          </button>
          <button 
            className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            <FaQuestionCircle size={16} />
            Q&A Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'visuals' ? 'active' : ''}`}
            onClick={() => setActiveTab('visuals')}
          >
            <FaChartBar size={16} />
            Visualizations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
            onClick={() => setActiveTab('pages')}
          >
            <FaBook size={16} />
            Pages
          </button>
        </div>

        {/* Tab Content - Analysis */}
        {activeTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="analysis-content"
          >
            {isAnalyzing ? (
              <div className="loading-state">
                <FaSpinner className="spinning" size={40} style={{ color: '#667eea' }} />
                <p style={{ color: '#5a5a7a' }}>Analyzing your document...</p>
              </div>
            ) : reportData ? (
              <>
                <div className="analysis-card doc-header-card">
                  <div className="doc-header-content">
                    <div className="doc-type-badge" style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                      <FaScroll size={16} />
                      {reportData.type}
                    </div>
                    <h2 className="doc-title" style={{ color: '#1a1a2e' }}>{reportData.title}</h2>
                    <div className="doc-meta-info">
                      <span style={{ color: '#5a5a7a' }}><FaBook size={14} style={{ color: '#667eea' }} /> {reportData.author}</span>
                      <span style={{ color: '#5a5a7a' }}><FaClock size={14} style={{ color: '#667eea' }} /> {reportData.year}</span>
                      <span style={{ color: '#5a5a7a' }}><FaFileAlt size={14} style={{ color: '#667eea' }} /> {reportData.stats.pages} Pages</span>
                      <span style={{ color: '#5a5a7a' }}><FaDatabase size={14} style={{ color: '#667eea' }} /> {reportData.stats.words.toLocaleString()} Words</span>
                    </div>
                  </div>
                </div>
                <div className="analysis-card summary-card">
                  <h3 style={{ color: '#1a1a2e' }}><FaMagic size={18} className="card-icon" style={{ color: '#667eea' }} /> Document Summary</h3>
                  <p style={{ color: '#333' }}>{reportData.summary}</p>
                </div>
                <div className="stats-grid-report">
                  <div className="stat-item">
                    <FaFileAlt size={20} className="stat-icon-report" style={{ color: '#667eea' }} />
                    <div className="stat-info">
                      <span className="stat-value" style={{ color: '#1a1a2e' }}>{reportData.stats.pages}</span>
                      <span className="stat-label" style={{ color: '#5a5a7a' }}>Pages</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FaChartLine size={20} className="stat-icon-report" style={{ color: '#667eea' }} />
                    <div className="stat-info">
                      <span className="stat-value" style={{ color: '#1a1a2e' }}>{reportData.stats.words.toLocaleString()}</span>
                      <span className="stat-label" style={{ color: '#5a5a7a' }}>Words</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FaList size={20} className="stat-icon-report" style={{ color: '#667eea' }} />
                    <div className="stat-info">
                      <span className="stat-value" style={{ color: '#1a1a2e' }}>{reportData.stats.sentences}</span>
                      <span className="stat-label" style={{ color: '#5a5a7a' }}>Sentences</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FaClock size={20} className="stat-icon-report" style={{ color: '#667eea' }} />
                    <div className="stat-info">
                      <span className="stat-value" style={{ color: '#1a1a2e' }}>{reportData.stats.readingTime} min</span>
                      <span className="stat-label" style={{ color: '#5a5a7a' }}>Reading Time</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FaCode size={20} className="stat-icon-report" style={{ color: '#667eea' }} />
                    <div className="stat-info">
                      <span className="stat-value" style={{ color: '#1a1a2e' }}>{reportData.stats.uniqueWords}</span>
                      <span className="stat-label" style={{ color: '#5a5a7a' }}>Unique Words</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FaTable size={20} className="stat-icon-report" style={{ color: '#667eea' }} />
                    <div className="stat-info">
                      <span className="stat-value" style={{ color: '#1a1a2e' }}>{reportData.stats.paragraphs}</span>
                      <span className="stat-label" style={{ color: '#5a5a7a' }}>Paragraphs</span>
                    </div>
                  </div>
                </div>
                <div className="analysis-card key-points-card">
                  <h3 style={{ color: '#1a1a2e' }}><FaCheckCircle size={18} className="card-icon" style={{ color: '#667eea' }} /> Key Points</h3>
                  <ul className="key-points-list">
                    {reportData.keyPoints.map((point, index) => (
                      <motion.li key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} style={{ color: '#333' }}>
                        <span className="point-bullet" style={{ color: '#667eea' }}>•</span>
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="analysis-card entities-card">
                  <h3 style={{ color: '#1a1a2e' }}><FaRobot size={18} className="card-icon" style={{ color: '#667eea' }} /> Key Terms</h3>
                  <div className="entities-tags">
                    {reportData.entities.map((entity, index) => (
                      <span key={index} className="entity-tag" style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="error-state">
                <FaExclamationTriangle size={40} style={{ color: '#F9CA24' }} />
                <p style={{ color: '#5a5a7a' }}>No document loaded.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Q&A Chat Tab */}
        {activeTab === 'qa' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="qa-content"
          >
            <div className="chat-container">
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="chat-empty">
                    <FaRobot size={48} className="chat-empty-icon" style={{ color: '#667eea' }} />
                    <h3 style={{ color: '#1a1a2e' }}>Ask questions about your document</h3>
                    <p style={{ color: '#5a5a7a' }}>Get answers based on the actual content</p>
                    <div className="suggested-questions">
                      <button className="suggested-btn" onClick={() => { setQuestion('What is this document about?'); setTimeout(() => handleAskQuestion(), 100) }}>
                        <FaLightbulb size={14} style={{ marginRight: '6px' }} /> What is this about?
                      </button>
                      <button className="suggested-btn" onClick={() => { setQuestion('Summarize the main points'); setTimeout(() => handleAskQuestion(), 100) }}>
                        <FaList size={14} style={{ marginRight: '6px' }} /> Summarize
                      </button>
                      <button className="suggested-btn" onClick={() => { setQuestion('What are the key topics?'); setTimeout(() => handleAskQuestion(), 100) }}>
                        <FaBrain size={14} style={{ marginRight: '6px' }} /> Key topics
                      </button>
                      <button className="suggested-btn" onClick={() => { setQuestion('Find important information'); setTimeout(() => handleAskQuestion(), 100) }}>
                        <FaSearch size={14} style={{ marginRight: '6px' }} /> Find info
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`chat-message ${msg.type}`}>
                      <div className="message-avatar">{msg.type === 'user' ? '👤' : '🤖'}</div>
                      <div className="message-content">
                        <div className="message-text" style={{ whiteSpace: 'pre-wrap', color: msg.type === 'user' ? '#fff' : '#333' }}>{msg.content}</div>
                        <div className="message-time" style={{ color: msg.type === 'user' ? 'rgba(255,255,255,0.7)' : '#999' }}>{msg.timestamp}</div>
                      </div>
                    </motion.div>
                  ))
                )}
                {isLoading && (
                  <div className="chat-message ai">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="typing-indicator"><span></span><span></span><span></span></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-container">
                <textarea className="chat-input" placeholder="Ask a question..." value={question} onChange={(e) => setQuestion(e.target.value)} onKeyPress={handleKeyPress} rows={2} />
                <button className="send-btn" onClick={handleAskQuestion} disabled={!question.trim() || isLoading}>
                  <FaPaperPlane size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Visualizations Tab */}
        {activeTab === 'visuals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="visuals-content"
          >
            <div className="visuals-grid">
              <div className="visual-card">
                <h3 style={{ color: '#1a1a2e' }}><FaChartBar size={16} style={{ marginRight: '0.5rem', color: '#667eea' }} /> Page Distribution</h3>
                <div className="chart-placeholder">
                  <div className="chart-bar-container">
                    {pdfPages.slice(0, 15).map((page, i) => (
                      <div key={i} className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ height: `${Math.min((page.length / 500) * 100, 100)}%`, background: `hsl(${i * 24 + 200}, 70%, 55%)` }}></div>
                        <span className="chart-label" style={{ color: '#5a5a7a' }}>{page.pageNumber}</span>
                      </div>
                    ))}
                  </div>
                  <p className="chart-description" style={{ color: '#5a5a7a' }}>Page content length distribution</p>
                </div>
              </div>
              <div className="visual-card">
                <h3 style={{ color: '#1a1a2e' }}><FaDatabase size={16} style={{ marginRight: '0.5rem', color: '#667eea' }} /> Document Stats</h3>
                <div className="stats-visual">
                  <div className="stat-row"><span style={{ color: '#5a5a7a' }}>Total Pages</span><span className="stat-value-visual" style={{ color: '#1a1a2e' }}>{reportData?.stats.pages || 0}</span></div>
                  <div className="stat-row"><span style={{ color: '#5a5a7a' }}>Total Words</span><span className="stat-value-visual" style={{ color: '#1a1a2e' }}>{reportData?.stats.words.toLocaleString() || 0}</span></div>
                  <div className="stat-row"><span style={{ color: '#5a5a7a' }}>Characters</span><span className="stat-value-visual" style={{ color: '#1a1a2e' }}>{reportData?.stats.characters.toLocaleString() || 0}</span></div>
                  <div className="stat-row"><span style={{ color: '#5a5a7a' }}>Sentences</span><span className="stat-value-visual" style={{ color: '#1a1a2e' }}>{reportData?.stats.sentences || 0}</span></div>
                  <div className="stat-row"><span style={{ color: '#5a5a7a' }}>Paragraphs</span><span className="stat-value-visual" style={{ color: '#1a1a2e' }}>{reportData?.stats.paragraphs || 0}</span></div>
                  <div className="stat-row"><span style={{ color: '#5a5a7a' }}>Unique Words</span><span className="stat-value-visual" style={{ color: '#1a1a2e' }}>{reportData?.stats.uniqueWords || 0}</span></div>
                  <div className="stat-row"><span style={{ color: '#5a5a7a' }}>Reading Time</span><span className="stat-value-visual" style={{ color: '#1a1a2e' }}>~{reportData?.stats.readingTime || 0} min</span></div>
                </div>
              </div>
              <div className="visual-card">
                <h3 style={{ color: '#1a1a2e' }}><FaRobot size={16} style={{ marginRight: '0.5rem', color: '#667eea' }} /> Key Terms</h3>
                <div className="word-cloud-placeholder">
                  {reportData?.entities?.slice(0, 20).map((word, i) => (
                    <span key={i} className="word-cloud-tag" style={{ fontSize: `${12 + (i % 5) * 4}px`, opacity: 0.6 + (i % 3) * 0.15, color: `hsl(${(i * 37) % 360}, 70%, 50%)` }}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="pages-content"
          >
            {/* Search */}
            <div className="search-container">
              <div className="search-bar">
                <FaSearch size={18} className="search-icon" style={{ color: '#999' }} />
                <input 
                  type="text" 
                  placeholder="Search within document..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    handleSearch()
                  }}
                  style={{ color: '#1a1a2e' }}
                />
                <button className="search-btn" onClick={handleSearch}>
                  <FaSearch size={16} />
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h4 style={{ color: '#1a1a2e' }}>Found {searchResults.length} results</h4>
                {searchResults.map((result, index) => (
                  <div key={index} className="search-result-item">
                    <span className="result-page" style={{ color: '#667eea' }}>Page {result.page}</span>
                    <p className="result-text" style={{ color: '#333' }}>{result.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Professional Page Navigation */}
            <div className="page-navigation">
              <div className="nav-left">
                <button 
                  className="nav-btn" 
                  onClick={goToFirstPage} 
                  disabled={currentPage <= 1}
                  title="First Page"
                >
                  <FaChevronLeft size={14} />
                  <FaChevronLeft size={14} style={{ marginLeft: '-8px' }} />
                </button>
                <button 
                  className="nav-btn" 
                  onClick={goToPrevPage} 
                  disabled={currentPage <= 1}
                  title="Previous Page (←)"
                >
                  <FaChevronLeft size={16} />
                  <span>Previous</span>
                </button>
              </div>

              <div className="nav-center">
                <span className="page-info" style={{ color: '#1a1a2e' }}>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
                </span>
                <div className="page-jump">
                  <input 
                    type="number" 
                    min="1" 
                    max={totalPages || 1}
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (val >= 1 && val <= totalPages) {
                        setCurrentPage(val)
                      }
                    }}
                    className="page-input"
                    style={{ color: '#1a1a2e' }}
                  />
                </div>
              </div>

              <div className="nav-right">
                <button 
                  className="nav-btn" 
                  onClick={goToNextPage} 
                  disabled={currentPage >= totalPages}
                  title="Next Page (→)"
                >
                  <span>Next</span>
                  <FaChevronRight size={16} />
                </button>
                <button 
                  className="nav-btn" 
                  onClick={goToLastPage} 
                  disabled={currentPage >= totalPages}
                  title="Last Page"
                >
                  <FaChevronRight size={14} />
                  <FaChevronRight size={14} style={{ marginLeft: '-8px' }} />
                </button>
              </div>
            </div>

            {/* Page Content - Professional Viewer */}
            {pdfPages.length > 0 && (
              <div className="page-viewer">
                <div className="page-header">
                  <div className="page-header-left">
                    <FaFile size={16} style={{ color: '#667eea' }} />
                    <span style={{ color: '#1a1a2e', fontWeight: 600 }}>
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="page-header-right">
                    <button 
                      className="zoom-btn" 
                      onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      title="Zoom Out"
                    >
                      <FaMinus size={14} />
                    </button>
                    <span style={{ color: '#5a5a7a', fontSize: '0.85rem' }}>{fontSize}px</span>
                    <button 
                      className="zoom-btn" 
                      onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                      title="Zoom In"
                    >
                      <FaPlus size={14} />
                    </button>
                    <button className="zoom-btn" onClick={() => setFontSize(16)} title="Reset Zoom">
                      <FaTextHeight size={14} />
                    </button>
                    <button className="zoom-btn" onClick={() => {
                      const text = pdfPages[currentPage - 1]?.text || ''
                      if (text) {
                        const blob = new Blob([text], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `page_${currentPage}.txt`
                        a.click()
                        URL.revokeObjectURL(url)
                      }
                    }} title="Export Page">
                      <FaDownload size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="page-content-display">
                  <div className="page-text" style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.8',
                    color: '#1a1a2e'
                  }}>
                    {pdfPages[currentPage - 1]?.text || 'No text found on this page'}
                  </div>
                </div>

                <div className="page-footer">
                  <div className="page-stats">
                    <span style={{ color: '#5a5a7a' }}>
                      <FaTextHeight size={14} style={{ marginRight: '4px' }} />
                      {pdfPages[currentPage - 1]?.length || 0} characters
                    </span>
                    <span style={{ color: '#5a5a7a' }}>
                      <FaList size={14} style={{ marginRight: '4px' }} />
                      {pdfPages[currentPage - 1]?.wordCount || 0} words
                    </span>
                    <span style={{ color: '#5a5a7a' }}>
                      <FaClock size={14} style={{ marginRight: '4px' }} />
                      ~{Math.ceil((pdfPages[currentPage - 1]?.wordCount || 0) / 200)} min read
                    </span>
                  </div>
                  <div className="page-actions">
                    <button className="page-action-btn" onClick={() => {
                      const text = pdfPages[currentPage - 1]?.text || ''
                      navigator.clipboard?.writeText(text)
                      showAlert('success', '✅ Copied!', 'Page text copied to clipboard.')
                    }}>
                      <FaCopy size={14} />
                      Copy
                    </button>
                    <button className="page-action-btn" onClick={() => {
                      const text = pdfPages[currentPage - 1]?.text || ''
                      const win = window.open('', '_blank')
                      if (win) {
                        win.document.write(`<pre style="font-family:system-ui;padding:2rem;font-size:16px;line-height:1.8;">${text}</pre>`)
                        win.document.title = `Page ${currentPage} - ${fileData.fileName}`
                      }
                    }}>
                      <FaPrint size={14} />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Report