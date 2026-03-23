import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, FileText, MessageSquare, List, AlignLeft, Loader2,
  AlertCircle, Clock, Sparkles, Download, Share2, MoreVertical,
  Bot, User,Globe, Copy, CheckCircle, Bookmark, ExternalLink
} from 'lucide-react'
import ChatBox from '../components/ChatBox'
import EntitiesPanel from '../components/EntitiesPanel'
import { documentsApi } from '../utils/api'

const TABS = [
  { id: 'summary', label: 'Summary', icon: AlignLeft, description: 'AI overview', color: 'from-indigo-500 to-purple-500' },
  { id: 'entities', label: 'Entities', icon: List, description: 'Extracted data', color: 'from-emerald-500 to-teal-500' },
  { id: 'text', label: 'Content', icon: FileText, description: 'Raw text', color: 'from-slate-500 to-slate-600' },
  { id: 'chat', label: 'Ask AI', icon: MessageSquare, description: 'Interactive Q&A', color: 'from-amber-500 to-orange-500', featured: true },
]

export default function DocumentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const fetchDocument = useCallback(async () => {
    if (!id || id === 'undefined') {
      setError('Invalid document ID')
      setLoading(false)
      return
    }

    try {
      const data = await documentsApi.get(id)
      setDocument(data)
      setError(null)
    } catch (err) {
      setError(err.response?.status === 404 ? 'Document not found' : 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDocument()
    const interval = setInterval(() => {
      if (document?.status === 'processing') fetchDocument()
    }, 3000)
    return () => clearInterval(interval)
  }, [id, document?.status, fetchDocument])

  const handleCopy = () => {
    navigator.clipboard.writeText(document?.summary || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/30">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-3xl bg-indigo-500 blur-2xl opacity-30 animate-pulse" />
        </div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse">Loading document...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center mb-6 animate-bounce">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">{error}</h2>
        <p className="text-slate-500 mb-8 max-w-md">The document you're looking for doesn't exist or couldn't be loaded.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back to Documents
        </Link>
      </div>
    )
  }

  if (!document) return null

  const statusConfig = {
    processing: { 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200',
      label: 'Processing',
      animate: true 
    },
    completed: { 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200',
      label: 'Analyzed',
      animate: false 
    },
    error: { 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      label: 'Error',
      animate: false 
    },
  }

  const status = statusConfig[document.status] || statusConfig.processing

  return (
    <div className="space-y-6 pt-20 animate-in">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 truncate">
                {document.original_filename || document.filename}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.bg} ${status.color} ${status.border}`}>
                <status.icon size={14} className={status.animate ? 'animate-spin' : ''} />
                {status.label}
              </span>
              {document.document_type && document.document_type !== 'unknown' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Sparkles size={12} />
                  {document.document_type.replace('_', ' ')}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{new Date(document.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
              {document.confidence > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.round(document.confidence * 100)}%` }}
                      />
                    </div>
                    {Math.round(document.confidence * 100)}% confidence
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors relative"
          >
            {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Processing State */}
      {document.status === 'processing' && (
        <div className="card-elevated p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/30 animate-pulse">
              <Clock className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">AI is Analyzing Your Document</h3>
            <p className="text-slate-500 max-w-lg mx-auto mb-8 text-lg">
              Our advanced AI is extracting entities, summarizing content, and preparing interactive Q&A. This usually takes 10-30 seconds.
            </p>
            <div className="max-w-md mx-auto h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-[shimmer_2s_infinite]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {document.status === 'error' && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Processing Failed</h3>
              <p className="text-red-700 leading-relaxed">
                {document.metadata?.error || 'An unexpected error occurred while analyzing this document. Please try uploading again.'}
              </p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-colors"
              >
                Upload New Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {document.status === 'completed' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-3">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]' 
                      : 'hover:bg-white hover:shadow-md text-slate-600 hover:text-indigo-600'
                  } ${tab.featured && !isActive ? 'ring-2 ring-amber-200 bg-amber-50/50' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive ? 'bg-white/20' : `bg-gradient-to-br ${tab.color} text-white shadow-lg`
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{tab.label}</p>
                    <p className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {tab.description}
                    </p>
                  </div>
                  {isActive && <ExternalLink className="w-4 h-4 text-indigo-200" />}
                </button>
              )
            })}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="card-elevated p-8 min-h-[600px]">
              {activeTab === 'summary' && (
                <div className="animate-in space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">AI-Generated Summary</h2>
                        <p className="text-slate-500">Powered by LLaMA 3 via Groq</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="btn-secondary flex items-center gap-2"
                    >
                      {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  
                  <div className="prose prose-slate prose-lg max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {document.summary || 'No summary available for this document.'}
                    </p>
                  </div>

                  {document.metadata && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Document Metadata</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Word Count', value: document.metadata.word_count?.toLocaleString() || 'N/A', icon: FileText },
                          { label: 'Language', value: document.language?.toUpperCase() || 'Auto', icon: Globe },
                          { label: 'Confidence', value: `${(document.confidence * 100).toFixed(0)}%`, icon: CheckCircle },
                          { label: 'Pages', value: document.metadata.page_count || 'N/A', icon: FileText },
                        ].map((item) => (
                          <div key={item.label} className="bg-slate-50 rounded-xl p-4 hover:bg-indigo-50 transition-colors group">
                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                            <p className="font-bold text-slate-900">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'entities' && (
                <div className="animate-in">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <List className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Extracted Entities</h2>
                      <p className="text-slate-500">Structured data extracted by AI</p>
                    </div>
                  </div>
                  <EntitiesPanel entities={document.entities} anomalies={document.anomalies} />
                </div>
              )}

              {activeTab === 'text' && (
                <div className="animate-in">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Document Content</h2>
                      <p className="text-slate-500">Full extracted text</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 max-h-[600px] overflow-y-auto scrollbar-thin border border-slate-100">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {document.raw_text || 'No text content available'}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="h-[600px] animate-in">
                  <ChatBox 
                    docId={id} 
                    suggestedQuestions={document.metadata?.suggested_questions || []}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  )
}