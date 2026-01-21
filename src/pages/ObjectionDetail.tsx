import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getPurchaseObjectionResponse, getSellObjectionResponse, getSimulationResponse, extractTextFromPDFWithAI } from '../lib/openai'
import * as pdfjsLib from 'pdfjs-dist'
import Sidebar from '../components/Sidebar'
import ChatInterface from '../components/ChatInterface'
import ConfirmModal from '../components/ConfirmModal'
import { jsPDF } from 'jspdf'
import { ArrowLeft, Save, Trash2, FileText, Layout, MessageCircle, Play, CheckCircle2, Clock } from 'lucide-react'

// Set worker source for PDF.js with fallback support
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
} catch (err) {
  console.warn('Failed to set local PDF worker, using CDN fallback')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}
import '../styles/layout.css'
import '../styles/coach.css'

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export default function ObjectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const [formData, setFormData] = useState({
    name: '',
    type: 'purchase',
    product_info: '',
    price: '',
    file_url: '',
    context_text: '',
    status: 'in_progress'
  })

  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'edit' | 'coach' | 'simulation'>('edit')
  const [messages, setMessages] = useState<Message[]>([])
  const [simulationMessages, setSimulationMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [fileName, setFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning';
    confirmText: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning',
    confirmText: 'Confirm'
  })

  useEffect(() => {
    if (!isNew && id) {
      fetchObjection()
    } else {
      setMode('edit')
    }
  }, [id, isNew])

  const fetchObjection = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('objections')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          ...data,
          status: data.status || 'in_progress'
        })
        if (data.chat_history && Array.isArray(data.chat_history) && data.chat_history.length > 0) {
          setMessages(data.chat_history as Message[])
        } else {
          resetChat(data)
        }

        if (data.simulation_history && Array.isArray(data.simulation_history)) {
          setSimulationMessages(data.simulation_history)
        } else {
          resetSimulation(data)
        }
      }
    } catch (error) {
      console.error('Error fetching objection:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const resetChat = (data: any) => {
    const initialMessage: Message = {
      role: 'assistant',
      content: `Hello! I am your **Objection Coach**. I've analyzed your details for "${data.name || 'this project'}". \n\nHow can I guide you today? I can suggest responses, compare market benchmarks, or help you refine your value proposition.`
    }
    setMessages([initialMessage])
  }

  const resetSimulation = (data: any) => {
    const persona = data.type === 'purchase' ? 'Prospect' : 'Vendor'
    const initialMsg: Message = {
      role: 'assistant',
      content: `*Scenario Started: I am the ${persona}.*\n\n"Thanks for coming. Regarding "${data.name}", I have some serious concerns about this. Convince me why I should move forward."`
    }
    setSimulationMessages([initialMsg])
  }

  const handleSendMessage = async (inputValue: string) => {
    const currentMessages = mode === 'simulation' ? simulationMessages : messages
    const userMsg: Message = { role: 'user', content: inputValue }
    const updatedMessages = [...currentMessages, userMsg]

    if (mode === 'simulation') setSimulationMessages(updatedMessages)
    else setMessages(updatedMessages)

    setIsTyping(true)

    try {
      let aiResponseText = ''

      if (mode === 'simulation') {
        aiResponseText = await getSimulationResponse(
          formData.product_info || '',
          formData.name || '',
          formData.context_text || '',
          formData.price || '',
          formData.type as 'purchase' | 'sell',
          updatedMessages
        )
      } else {
        if (formData.type === 'purchase') {
          aiResponseText = await getPurchaseObjectionResponse(
            formData.product_info || '',
            formData.name || '',
            formData.context_text || '',
            formData.price || '',
            updatedMessages.slice(-10)
          )
        } else {
          aiResponseText = await getSellObjectionResponse(
            formData.product_info || '',
            formData.name || '',
            formData.context_text || '',
            formData.price || '',
            updatedMessages.slice(-10)
          )
        }
      }

      const finalMessages: Message[] = [...updatedMessages, { role: 'assistant' as const, content: aiResponseText }]

      if (mode === 'simulation') {
        setSimulationMessages(finalMessages)
        if (!isNew) {
          await supabase.from('objections').update({ simulation_history: finalMessages }).eq('id', id)
        }
      } else {
        setMessages(finalMessages)
        if (!isNew) {
          await supabase.from('objections').update({ chat_history: finalMessages }).eq('id', id)
        }
      }
    } catch (error) {
      console.error('AI Error:', error)
      const errorMsg: Message = { role: 'system' as const, content: 'Communication error. Please try again.' }
      if (mode === 'simulation') setSimulationMessages(prev => [...prev, errorMsg])
      else setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const triggerClearChat = () => {
    setModalConfig({
      isOpen: true,
      title: mode === 'simulation' ? 'Reset Scenario' : 'Clear Chat History',
      message: 'This will permanently delete all messages in this conversation.',
      confirmText: mode === 'simulation' ? 'Reset' : 'Clear',
      variant: 'danger',
      onConfirm: executeClearChat
    })
  }

  const executeClearChat = async () => {
    if (mode === 'simulation') {
      resetSimulation(formData)
      if (!isNew) await supabase.from('objections').update({ simulation_history: null }).eq('id', id)
    } else {
      resetChat(formData)
      if (!isNew) await supabase.from('objections').update({ chat_history: null }).eq('id', id)
    }
    setModalConfig({ ...modalConfig, isOpen: false })
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    let yPos = 20
    const targetMessages = mode === 'simulation' ? simulationMessages : messages
    const reportType = mode === 'simulation' ? 'Simulation Transcript' : 'Strategy Objection Report'

    doc.setFontSize(22)
    doc.setTextColor(197, 160, 89)
    doc.text(`Objection Coach: ${reportType}`, 20, yPos)
    yPos += 15

    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.setTextColor(80, 80, 80)
    doc.text(`Objection: ${formData.name}`, 20, yPos)
    yPos += 7
    doc.text(`Mode: ${mode === 'simulation' ? 'Persona Simulation' : 'Consultative Coaching'}`, 20, yPos)
    yPos += 15

    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPos, 190, yPos)
    yPos += 15

    targetMessages.forEach((msg) => {
      const isAI = msg.role === 'assistant'
      doc.setFont(undefined, 'bold')
      doc.setTextColor(isAI ? 197 : 50, isAI ? 160 : 50, isAI ? 89 : 50)
      doc.text(isAI ? 'COACH/PERSONA:' : 'USER:', 20, yPos)
      yPos += 7
      doc.setFont(undefined, 'normal')
      doc.setTextColor(60, 60, 60)
      const splitText = doc.splitTextToSize(msg.content.replace(/\*\*/g, '').replace(/\*/g, ''), 170)
      if (yPos + (splitText.length * 7) > 280) { doc.addPage(); yPos = 20; }
      doc.text(splitText, 20, yPos)
      yPos += (splitText.length * 7) + 8
    })
    doc.save(`Objection-${mode}-${formData.name.replace(/\s+/g, '-')}.pdf`)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.context_text || formData.context_text.trim() === '') {
      alert('Supporting documents are required. Please upload a PDF or TXT file.')
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('You must be logged in to save.')
      const { id: _, created_at, user_id, chat_history, simulation_history, ...cleanFormData } = formData as any;
      const payload = { ...cleanFormData, user_id: session.user.id }
      let result
      if (isNew) result = await supabase.from('objections').insert([payload]).select()
      else result = await supabase.from('objections').update(payload).eq('id', id).select()
      if (result.error) throw result.error
      if (isNew) {
        const newId = result.data?.[0]?.id;
        if (newId) navigate(`/objection/${newId}`, { replace: true })
        else navigate('/dashboard')
      } else alert('Objection saved successfully.')
    } catch (error: any) { alert('Error saving: ' + error.message) }
    finally { setLoading(false) }
  }

  const triggerDelete = () => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Objection',
      message: `Are you sure you want to delete "${formData.name}"?`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: executeDelete
    })
  }

  const executeDelete = async () => {
    const { error } = await supabase.from('objections').delete().eq('id', id)
    if (error) alert(error.message)
    else navigate('/dashboard')
  }

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return;

    setIsUploading(true)
    setUploadError('')
    setUploadStatus('')
    setFileName(file.name)

    try {
      let text = '';

      if (file.type === 'application/pdf') {
        console.log('Processing PDF file:', file.name)
        setUploadStatus('Loading PDF...')

        try {
          const arrayBuffer = await file.arrayBuffer()
          console.log('PDF arrayBuffer loaded, size:', arrayBuffer.byteLength)

          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
          const pdf = await loadingTask.promise
          console.log('PDF loaded, pages:', pdf.numPages)

          setUploadStatus('Extracting text from PDF...')
          let fullText = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str || '').join(' ')
            fullText += pageText + '\n'
          }
          text = fullText.trim()
          console.log('PDF text extracted, length:', text.length)

          if (text.length < 50) {
            console.log('PDF appears to be image-based or has minimal text. Using AI Vision...')
            setUploadStatus('Document appears to be an image. Using AI Vision to read content...')
            try {
              text = await extractTextFromPDFWithAI(pdf)
              console.log('AI Vision extraction complete, length:', text.length)
            } catch (aiError: any) {
              console.error('AI Vision extraction error:', aiError)
              setUploadError(`AI Vision Error: ${aiError.message}`)
              if (fileInputRef.current) fileInputRef.current.value = ''
              setIsUploading(false)
              setUploadStatus('')
              return
            }
          }
        } catch (pdfError: any) {
          console.error('PDF parsing error:', pdfError)
          setUploadError(`PDF Error: ${pdfError.message}`)
          if (fileInputRef.current) fileInputRef.current.value = ''
          setIsUploading(false)
          setUploadStatus('')
          return
        }
      } else {
        console.log('Processing text file:', file.name)
        setUploadStatus('Reading text file...')
        text = await file.text()
        console.log('Text file loaded, length:', text.length)
      }

      if (text && text.trim().length > 0) {
        setFormData(prev => ({ ...prev, context_text: text }))
        setUploadError('')
        setUploadStatus('')
        console.log('Document uploaded successfully')
      } else {
        setUploadError('The document appears to be empty or could not be read.')
        setUploadStatus('')
      }
    } catch (err: any) {
      console.error('File upload error:', err)
      setUploadError(`Upload failed: ${err.message}`)
      setUploadStatus('')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="detail-container">
          <div className="detail-header">
            <div className="header-left">
              <Link to="/dashboard" className="back-link">
                <ArrowLeft size={12} /> BACK TO DASHBOARD
              </Link>
              <h1 className="luxury-text" style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>
                {isNew ? 'New Objection' : formData.name}
              </h1>
            </div>

            {!isNew && (
              <div className="mode-toggle">
                <button className={`mode-btn ${mode === 'edit' ? 'active' : ''}`} onClick={() => setMode('edit')}>
                  <FileText size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Details
                </button>
                <button className={`mode-btn ${mode === 'coach' ? 'active' : ''}`} onClick={() => setMode('coach')}>
                  <MessageCircle size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Coach
                </button>
                <button className={`mode-btn ${mode === 'simulation' ? 'active' : ''}`} onClick={() => setMode('simulation')}>
                  <Play size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Scenario
                </button>
              </div>
            )}
          </div>

          {mode === 'edit' ? (
            <form onSubmit={handleSave} className="edit-form glass">
              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Objection Title</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., 'Competitor pricing is 20% lower'" required />
                </div>
                <div style={{ marginLeft: '2rem' }}>
                  <label className="form-label">Work Status</label>
                  <div className="status-toggle-group">
                    <button
                      type="button"
                      className={`status-chip in_progress ${formData.status === 'in_progress' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, status: 'in_progress' })}
                    >
                      <Clock size={12} /> In Progress
                    </button>
                    <button
                      type="button"
                      className={`status-chip completed ${formData.status === 'completed' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, status: 'completed' })}
                    >
                      <CheckCircle2 size={12} /> Completed
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Act as</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="purchase">Purchase Coach</option>
                    <option value="sell">Sell Coach</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price/Budget</label>
                  <input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. RM 599.00" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Supporting Documents <span style={{ color: '#c5a059' }}>*</span>
                </label>
                <div className="file-upload-wrapper">
                  <label className="file-upload-label">
                    <Layout size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <span>
                      {isUploading
                        ? 'Processing file...'
                        : fileName
                        ? `File: ${fileName}`
                        : 'Upload PDF or TXT guides (Required)'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="file-upload-input"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {isUploading && (
                  <p style={{ fontSize: '0.85rem', color: '#c5a059', marginTop: '0.5rem' }}>
                    {uploadStatus || 'Uploading and processing document...'}
                  </p>
                )}
                {uploadError && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#f44336', marginBottom: '0.25rem' }}>
                      {uploadError}
                    </p>
                    {uploadError.includes('PDF') && (
                      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                        Tip: If PDF upload fails, try converting your document to TXT format first.
                      </p>
                    )}
                  </div>
                )}
                {!isUploading && !uploadError && formData.context_text && (
                  <p style={{ fontSize: '0.85rem', color: '#4caf50', marginTop: '0.5rem' }}>
                    ✓ Document uploaded successfully ({formData.context_text.length} characters)
                    {formData.context_text.includes('--- Page') && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
                        (Extracted using AI Vision)
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Product / Service Specifications</label>
                <textarea value={formData.product_info} onChange={e => setFormData({ ...formData, product_info: e.target.value })} placeholder="Describe the value proposition and key features..." rows={4} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
                {!isNew && (
                  <button type="button" onClick={triggerDelete} className="premium-btn delete-btn-lux">
                    <Trash2 size={14} style={{ marginRight: '8px' }} /> DELETE
                  </button>
                )}
                <button type="submit" className="premium-btn" disabled={loading}>
                  <Save size={14} style={{ marginRight: '8px' }} /> {loading ? 'SAVING...' : 'SAVE OBJECTION'}
                </button>
              </div>
            </form>
          ) : (
            <ChatInterface
              messages={mode === 'simulation' ? simulationMessages : messages}
              isTyping={isTyping}
              mode={mode === 'simulation' ? 'simulation' : 'coach'}
              onSendMessage={handleSendMessage}
              onClearChat={triggerClearChat}
              onDownloadPDF={handleDownloadPDF}
              onToggleMode={(m) => setMode(m)}
            />
          )}
        </div>
      </main>
      <ConfirmModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} variant={modalConfig.variant} confirmText={modalConfig.confirmText} />
    </div>
  )
}
