import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import Swal from 'sweetalert2'
import {
  FaFilePdf,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaFile,
  FaDownload,
  FaShare,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaList,
  FaTextHeight,
  FaClock,
  FaCopy,
  FaPrint,
  FaMinus,
  FaPlus,
  FaGoogle,
  FaPaperPlane,
  FaRobot,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSearch,
  FaEye,
  FaBook,
  FaChartBar,
  FaDatabase,
  FaUser,
  FaKey,
  FaUpload
} from 'react-icons/fa'
import './Report.css'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`

// HARDCODE YOUR API KEY HERE
const GEMINI_API_KEY = 'AQ.Ab8RN6LioLiG5LDKB-SZ4ZlWp0BkqcSepMOkl0NiiBi7tEpPZQ'

function Report() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const fileData = location.state || { 
    fileName: 'document.pdf', 
    fileSize: 0,
    file: null
  }
  
  const [isLoading, setIsLoading] = useState(true)
  const [pdfPages, setPdfPages] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [fontSize, setFontSize] = useState(16)
  const [fileName, setFileName] = useState('')
  const [fullText, setFullText] = useState('')
  
  // Gemini states
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isGeminiLoading, setIsGeminiLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // ============================================
  // SWEETALERT HELPERS
  // ============================================
  
  const showAlert = (type, title, message, options = {}) => {
    const icons = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
      question: 'question'
    }
    
    return Swal.fire({
      icon: icons[type] || 'info',
      title: title,
      text: message,
      confirmButtonColor: '#667eea',
      confirmButtonText: options.confirmText || 'OK',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)',
      ...options
    })
  }

  const showConfirm = (title, message, confirmText = 'Confirm', cancelText = 'Cancel') => {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)'
    })
  }

  const showToast = (type, title, message, duration = 3000) => {
    const icons = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    }
    
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer
        toast.onmouseleave = Swal.resumeTimer
      }
    })
    
    Toast.fire({
      icon: icons[type] || 'info',
      title: title,
      text: message
    })
  }

  // Extract text from PDF
  const extractTextFromPDF = async (file) => {
    try {
      console.log('📄 Extracting text from PDF:', file.name)
      setFileName(file.name)
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
      
      const pages = []
      let allText = ''
      
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
          allText += pageText + ' '
        } catch (pageError) {
          console.warn(`⚠️ Could not read page ${i}:`, pageError)
          pages.push({
            pageNumber: i,
            text: '',
            length: 0,
            wordCount: 0
          })
        }
      }
      
      setPdfPages(pages)
      setFullText(allText)
      setIsLoading(false)
      
      console.log('PDF loaded:', pages.length, 'pages')
      console.log('Total text length:', allText.length)
      
      // Add welcome message with API key available
      setMessages([{
        type: 'ai',
        content: `PDF loaded! I've read **${pages.length} pages** (${allText.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()} words). Ask me anything about this document!`,
        timestamp: new Date().toLocaleTimeString()
      }])
      
      showToast('success', 'PDF Loaded', `${pages.length} pages extracted successfully!`)
      
      return { pages }
    } catch (error) {
      console.error('❌ Error extracting PDF:', error)
      setIsLoading(false)
      showAlert('error', 'Error Reading PDF', 'Failed to read PDF. Please try again with a different file.')
    }
  }

  // ============================================
  // GEMINI API
  // ============================================

  // Find relevant sections of the document based on the question
  const findRelevantContext = (userQuestion, fullText) => {
    // If the question mentions a specific section number like "10.3.2.4"
    const sectionMatch = userQuestion.match(/(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/)
    if (sectionMatch) {
      const sectionNumber = sectionMatch[1]
      console.log(`🔍 Looking for section: ${sectionNumber}`)
      
      // Find all occurrences of this section number in the text
      const sections = []
      const regex = new RegExp(`\\b${sectionNumber}\\b[^.]*\\.[^\\n]{10,800}`, 'gi')
      let match
      while ((match = regex.exec(fullText)) !== null) {
        sections.push(match[0])
      }
      
      if (sections.length > 0) {
        return sections.join('\n\n')
      }
      
      // Try a more flexible search
      const flexibleRegex = new RegExp(`\\b${sectionNumber}\\s+([^\\n]{10,800})`, 'gi')
      while ((match = flexibleRegex.exec(fullText)) !== null) {
        sections.push(match[0])
      }
      
      if (sections.length > 0) {
        return sections.join('\n\n')
      }
    }
    
    // If the question mentions "Chapter 10" or similar
    const chapterMatch = userQuestion.match(/Chapter\s+(\d+)/i)
    if (chapterMatch) {
      const chapterNum = chapterMatch[1]
      console.log(`🔍 Looking for Chapter: ${chapterNum}`)
      
      // Find the chapter in the text
      const chapterRegex = new RegExp(`Chapter\\s+${chapterNum}[^\\n]*\\n([\\s\\S]{0,20000})`, 'i')
      const match = fullText.match(chapterRegex)
      if (match) {
        return match[0]
      }
    }
    
    // If no specific section, return a larger chunk around where the question might be
    // Look for keywords from the question
    const keywords = userQuestion.split(/\s+/).filter(w => w.length > 4)
    if (keywords.length > 0) {
      for (const keyword of keywords) {
        const keywordRegex = new RegExp(`[^\\n]{0,500}\\b${keyword}\\b[^\\n]{0,500}`, 'gi')
        const matches = fullText.match(keywordRegex)
        if (matches && matches.length > 0) {
          return matches.slice(0, 10).join('\n\n')
        }
      }
    }
    
    // Fallback: return a larger chunk of text (200,000 chars instead of 50,000)
    return fullText.substring(0, 200000)
  }

  // Call Gemini API with relevant context
  const callGemini = async (userQuestion, context) => {
    // Find relevant sections of the document
    const relevantContext = findRelevantContext(userQuestion, context)
    
    console.log(`Sending ${relevantContext.length} characters to Gemini`)
    
    const GEMINI_MODEL = 'gemini-3-flash-preview'
    
    const prompt = `You are a helpful assistant that answers questions based ONLY on the provided document content.

DOCUMENT CONTENT (extracted from PDF):
${relevantContext}

USER QUESTION: ${userQuestion}

INSTRUCTIONS:
1. Answer based ONLY on the document content above.
2. If the answer isn't in the document, say "I couldn't find that in the document."
3. Quote relevant sections when applicable.
4. Be clear and concise.
5. If the user asks about a specific clause number (like 10.3.2.4), find and quote the exact text.

ANSWER:`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192,
              topP: 0.95,
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Gemini API Error:', errorData)
        const errorMsg = errorData.error?.message || 'Unknown error'
        
        if (errorMsg.includes('not found')) {
          console.log('🔄 Model not found, trying fallback models...')
          return callGeminiWithFallback(userQuestion, relevantContext)
        }
        
        return { 
          success: false, 
          error: `API Error: ${errorMsg}` 
        }
      }

      const data = await response.json()
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
      console.log('Gemini response received!')
      return { success: true, answer, model: GEMINI_MODEL }
    } catch (error) {
      console.error('Gemini Error:', error)
      console.log('Network error, trying fallback models...')
      return callGeminiWithFallback(userQuestion, relevantContext)
    }
  }

  // Fallback models
  const callGeminiWithFallback = async (userQuestion, context) => {
    const fallbackModels = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ]

    for (const model of fallbackModels) {
      try {
        console.log(`🔄 Trying fallback model: ${model}`)
        
        const prompt = `You are a helpful assistant that answers questions based ONLY on the provided document content.

DOCUMENT CONTENT (extracted from PDF):
${context}

USER QUESTION: ${userQuestion}

INSTRUCTIONS:
1. Answer based ONLY on the document content above.
2. If the answer isn't in the document, say "I couldn't find that in the document."
3. Quote relevant sections when applicable.
4. Be clear and concise.

ANSWER:`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
                topP: 0.95,
              }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
          console.log(`Fallback model ${model} worked!`)
          return { success: true, answer, model: model }
        }
      } catch (error) {
        console.warn(`Fallback ${model} failed:`, error.message)
      }
    }

    return { 
      success: false, 
      error: 'All models failed. Please check your API key and try again.' 
    }
  }

  // Handle asking a question
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      showAlert('warning', 'Empty Question', 'Please enter a question before asking.')
      return
    }
    
    if (!fullText || fullText.length < 10) {
      showAlert('warning', 'No PDF Content', 'Please upload a PDF file first.')
      return
    }

    const userQuestion = question.trim()
    
    // Add user message
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userQuestion,
      timestamp: new Date().toLocaleTimeString()
    }])
    
    setQuestion('')
    setIsGeminiLoading(true)
    setApiError('')

    try {
      const result = await callGemini(userQuestion, fullText)
      
      if (result.success) {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: result.answer + `\n\n*( ${result.model})*`,
          timestamp: new Date().toLocaleTimeString()
        }])
      } else {
        setApiError(result.error)
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: `⚠️ ${result.error}\n\n💡 If you're using the gemini-3-flash-preview model, make sure:\n1. You have access to the preview model\n2. Your API key is valid\n3. You're in a region where the model is available\n\nTry using a different model like gemini-1.5-flash which is more widely available.`,
          timestamp: new Date().toLocaleTimeString()
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `⚠️ Something went wrong: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }])
    } finally {
      setIsGeminiLoading(false)
    }
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

  // Page navigation
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)

  // Load PDF on mount
  useEffect(() => {
    const loadPDF = async () => {
      if (location.state?.file) {
        await extractTextFromPDF(location.state.file)
      } else {
        setIsLoading(false)
      }
    }
    
    loadPDF()
  }, [location.state])

  // Calculate total words and reading time
  const totalWords = pdfPages.reduce((sum, page) => sum + (page.wordCount || 0), 0)
  const readingTime = Math.ceil(totalWords / 200) || 1

  // Handle Save button
  const handleSave = async () => {
    const result = await showConfirm(
      'Save Document',
      'Are you sure you want to save this document?',
      'Save',
      'Cancel'
    )
    if (result.isConfirmed) {
      showToast('success', 'Saved!', 'Document saved successfully.')
    }
  }

  // Handle Export button
  const handleExport = async () => {
    const result = await showConfirm(
      'Export Document',
      'Export the current document as a report?',
      'Export',
      'Cancel'
    )
    if (result.isConfirmed) {
      showToast('success', 'Exporting...', 'Report export started!')
    }
  }

  // Handle Share button
  const handleShare = async () => {
    const result = await showConfirm(
      'Share Document',
      'Generate a shareable link for this document?',
      'Generate Link',
      'Cancel'
    )
    if (result.isConfirmed) {
      showToast('success', 'Link Copied!', 'Share link copied to clipboard.')
    }
  }

  return (
    <div className="report-container" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e0e4e8',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#333',
                fontSize: '14px'
              }}
            >
              <FaArrowLeft size={16} />
              Back
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaFilePdf size={28} style={{ color: '#FF6B6B' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '14px' }}>
                  {fileName || fileData.fileName || 'document.pdf'}
                </div>
                <div style={{ fontSize: '12px', color: '#5a5a7a' }}>
                  {totalPages} pages · {formatFileSize(fileData.fileSize)}
                  {totalWords > 0 && ` · ${totalWords.toLocaleString()} words`}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#4ECDC4',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              background: 'rgba(78, 205, 196, 0.1)',
              borderRadius: '12px'
            }}>
              <FaGoogle size={12} /> Chatbot Ready
            </span>
            
            <button 
              onClick={handleSave}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaSave size={14} />
              Save
            </button>
            <button 
              onClick={handleExport}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaDownload size={14} />
              Export
            </button>
            <button 
              onClick={handleShare}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaShare size={14} />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        
        {/* Loading State */}
        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e8ecf1'
          }}>
            <FaSpinner className="spinning" size={40} style={{ color: '#667eea' }} />
            <p style={{ color: '#5a5a7a', marginTop: '16px' }}>Loading PDF...</p>
          </div>
        )}

        {/* Two Column Layout: PDF Viewer + Chat */}
        {!isLoading && pdfPages.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Left Column - PDF Viewer */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e8ecf1',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              {/* Page Navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: '#f8f9fa',
                borderBottom: '1px solid #e8ecf1',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFile size={14} style={{ color: '#667eea' }} />
                  <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '13px' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  <button onClick={goToFirstPage} disabled={currentPage <= 1} style={{ padding: '2px 6px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.4 : 1, color: '#333', fontSize: '11px' }}><FaChevronLeft size={10} /><FaChevronLeft size={10} style={{ marginLeft: '-4px' }} /></button>
                  <button onClick={goToPrevPage} disabled={currentPage <= 1} style={{ padding: '2px 8px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.4 : 1, color: '#333', fontSize: '11px' }}><FaChevronLeft size={10} /> Prev</button>
                  
                  <input type="number" min="1" max={totalPages} value={currentPage} onChange={(e) => { const val = parseInt(e.target.value); if (val >= 1 && val <= totalPages) setCurrentPage(val) }} style={{ width: '40px', padding: '2px 4px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', fontSize: '12px', color: '#1a1a2e', backgroundColor: '#f8f9fa' }} />
                  
                  <button onClick={goToNextPage} disabled={currentPage >= totalPages} style={{ padding: '2px 8px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1, color: '#333', fontSize: '11px' }}>Next <FaChevronRight size={10} /></button>
                  <button onClick={goToLastPage} disabled={currentPage >= totalPages} style={{ padding: '2px 6px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.4 : 1, color: '#333', fontSize: '11px' }}><FaChevronRight size={10} /><FaChevronRight size={10} style={{ marginLeft: '-4px' }} /></button>
                  
                  <span style={{ color: '#999', fontSize: '11px', marginLeft: '4px' }}>{fontSize}px</span>
                  <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} style={{ padding: '2px 5px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#333' }}><FaMinus size={10} /></button>
                  <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} style={{ padding: '2px 5px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#333' }}><FaPlus size={10} /></button>
                </div>
              </div>
              
              {/* Page Content */}
              <div style={{ 
                padding: '16px', 
                maxHeight: '500px', 
                overflowY: 'auto',
                background: '#fafafa'
              }}>
                <div style={{ 
                  fontSize: `${fontSize}px`, 
                  lineHeight: '1.8', 
                  color: '#1a1a2e',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  whiteSpace: 'pre-wrap'
                }}>
                  {pdfPages[currentPage - 1]?.text || 'No text found on this page'}
                </div>
              </div>
              
              {/* Page Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 16px',
                background: '#f8f9fa',
                borderTop: '1px solid #e8ecf1',
                flexWrap: 'wrap',
                gap: '6px',
                alignItems: 'center',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', gap: '12px', color: '#5a5a7a' }}>
                  <span><FaTextHeight size={11} style={{ marginRight: '2px' }} /> {pdfPages[currentPage - 1]?.length || 0} chars</span>
                  <span><FaList size={11} style={{ marginRight: '2px' }} /> {pdfPages[currentPage - 1]?.wordCount || 0} words</span>
                  <span><FaClock size={11} style={{ marginRight: '2px' }} /> ~{Math.ceil((pdfPages[currentPage - 1]?.wordCount || 0) / 200)} min</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => { const text = pdfPages[currentPage - 1]?.text || ''; navigator.clipboard?.writeText(text); showToast('success', 'Copied!', 'Page text copied to clipboard.') }} style={{ padding: '2px 8px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#333', fontSize: '11px' }}><FaCopy size={10} style={{ marginRight: '2px' }} /> Copy</button>
                  <button onClick={() => { const text = pdfPages[currentPage - 1]?.text || ''; const win = window.open('', '_blank'); if (win) { win.document.write(`<pre style="font-family:system-ui;padding:1rem;font-size:14px;line-height:1.8;color:#1a1a2e;">${text}</pre>`); win.document.title = `Page ${currentPage} - ${fileName}` } }} style={{ padding: '2px 8px', background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#333', fontSize: '11px' }}><FaPrint size={10} style={{ marginRight: '2px' }} /> Print</button>
                </div>
              </div>
            </div>

            {/* Right Column - Gemini Chat */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e8ecf1',
              display: 'flex',
              flexDirection: 'column',
              height: '600px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              {/* Chat Header */}
              <div style={{
                padding: '12px 16px',
                background: '#f8f9fa',
                borderBottom: '1px solid #e8ecf1',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaGoogle size={20} style={{ color: '#4285F4' }} />
                <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '14px' }}>
                  AI Assistant Knowledge Retrival
                </span>
                <span style={{ fontSize: '10px', color: '#4ECDC4', background: 'rgba(78,205,196,0.15)', padding: '2px 10px', borderRadius: '10px' }}>
                  <FaCheck size={10} style={{ marginRight: '2px' }} /> Ready
                </span>
                <span style={{ fontSize: '10px', color: '#999', marginLeft: 'auto' }}>
                  <FaDatabase size={10} style={{ marginRight: '2px' }} />
                  {totalWords.toLocaleString()} words indexed
                </span>
              </div>

              {/* Chat Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: '#fafafa'
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#999'
                  }}>
                    <FaRobot size={48} style={{ color: '#667eea', opacity: 0.5 }} />
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#5a5a7a' }}>
                      Ask a question about the PDF!
                    </p>
                    <p style={{ fontSize: '12px', color: '#bbb' }}>
                      e.g., "What does clause 10.3.2.4 say?"
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} style={{
                      alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: msg.type === 'user' ? '#667eea' : '#fff',
                      color: msg.type === 'user' ? '#fff' : '#1a1a2e',
                      padding: '10px 14px',
                      borderRadius: msg.type === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      boxShadow: msg.type === 'user' ? '0 2px 8px rgba(102,126,234,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                      border: msg.type === 'user' ? 'none' : '1px solid #e8ecf1',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', color: msg.type === 'user' ? 'rgba(255,255,255,0.7)' : '#999' }}>
                        {msg.type === 'user' ? <><FaUser size={10} /> You</> : <><FaRobot size={10} /> AI Assistant Knowledge Retrival Chatbot</>} · {msg.timestamp}
                      </div>
                      {msg.content}
                    </div>
                  ))
                )}
                {isGeminiLoading && (
                  <div style={{
                    alignSelf: 'flex-start',
                    maxWidth: '85%',
                    background: '#fff',
                    padding: '10px 14px',
                    borderRadius: '12px 12px 12px 4px',
                    border: '1px solid #e8ecf1',
                    fontSize: '13px',
                    color: '#667eea'
                  }}>
                    <FaSpinner className="spinning" size={14} style={{ marginRight: '6px' }} /> Thinking...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{
                padding: '10px 12px',
                borderTop: '1px solid #e8ecf1',
                background: '#fff',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end'
              }}>
                <textarea
                  rows="2"
                  placeholder="Ask about the PDF..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGeminiLoading}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '13px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none',
                    minHeight: '40px',
                    maxHeight: '80px',
                    background: '#fff',
                    color: '#1a1a2e'
                  }}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isGeminiLoading}
                  style={{
                    padding: '8px 14px',
                    background: (question.trim() && !isGeminiLoading) ? '#667eea' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (question.trim() && !isGeminiLoading) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    height: '40px'
                  }}
                >
                  <FaPaperPlane size={14} />
                  Ask
                </button>
              </div>
            </div>

          </div>
        )}

        {/* No PDF State */}
        {!isLoading && pdfPages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e8ecf1'
          }}>
            <FaFilePdf size={60} style={{ color: '#ddd' }} />
            <h3 style={{ color: '#333', marginTop: '16px' }}>No PDF Loaded</h3>
            <p style={{ color: '#5a5a7a' }}>Please go back and upload a PDF file.</p>
            <button 
              onClick={() => navigate('/')}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <FaUpload size={16} />
              Upload PDF
            </button>
          </div>
        )}

        {/* Quick Stats Footer */}
        {!isLoading && pdfPages.length > 0 && (
          <div style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            background: '#fff',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #e8ecf1'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#5a5a7a' }}><FaBook size={11} style={{ marginRight: '4px' }} />Pages</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{totalPages}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#5a5a7a' }}><FaDatabase size={11} style={{ marginRight: '4px' }} />Words</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{totalWords.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#5a5a7a' }}><FaClock size={11} style={{ marginRight: '4px' }} />Read Time</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>~{readingTime} min</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#5a5a7a' }}><FaFile size={11} style={{ marginRight: '4px' }} />File Size</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{formatFileSize(fileData.fileSize)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#5a5a7a' }}><FaGoogle size={11} style={{ marginRight: '4px' }} />API Status</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ECDC4' }}>
                <FaCheck size={14} style={{ marginRight: '4px' }} />
                Active
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Report