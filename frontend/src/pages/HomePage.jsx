import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Filter, RefreshCw, FileText, TrendingUp, Clock, CheckCircle2, 
  Sparkles, Upload, Search, LayoutGrid, List, ArrowRight 
} from 'lucide-react'
import UploadZone from '../components/UploadZone'
import DocumentCard from '../components/DocumentCard'
import { documentsApi } from '../utils/api'
import { motion } from 'framer-motion';

// Composant Stat Card Animé
const StatCard = ({ stat, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
        <stat.icon size={24} className="text-white" />
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
      
      {stat.trend && (
        <div className="absolute top-5 right-5 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} />
          {stat.trend}
        </div>
      )}
    </div>
  </motion.div>
)

export default function HomePage() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter] = useState('all')
  const [documentTypes, setDocumentTypes] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { document_type: filter } : {}
      const data = await documentsApi.list(params)
      setDocuments(data)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [filter])

  const fetchDocumentTypes = async () => {
    try {
      const data = await documentsApi.getTypes()
      setDocumentTypes(data)
    } catch (err) {
      console.error('Failed to fetch document types:', err)
    }
  }

  useEffect(() => {
    fetchDocuments()
    fetchDocumentTypes()
    
    // Polling intelligent
    const interval = setInterval(() => {
      if (!document.hidden && !showUpload) {
        fetchDocuments()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [filter, showUpload, fetchDocuments])

  const handleUploadSuccess = async (uploadResponse) => {
    setShowUpload(false)
    await fetchDocuments()
    
    const docId = uploadResponse?.id || uploadResponse?.document_id
    if (docId && docId !== 'undefined') {
      navigate(`/document/${docId}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      await documentsApi.delete(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  // Stats calculées
  const stats = {
    total: documents.length,
    processing: documents.filter(d => d.status === 'processing').length,
    completed: documents.filter(d => d.status === 'completed').length,
    error: documents.filter(d => d.status === 'error').length,
  }

  const statCards = [
    { 
      label: 'Total Documents', 
      value: stats.total, 
      icon: FileText, 
      gradient: 'from-slate-500 to-slate-600',
      trend: '+12%'
    },
    { 
      label: 'Processing', 
      value: stats.processing, 
      icon: Clock, 
      gradient: 'from-amber-400 to-orange-500',
    },
    { 
      label: 'Analyzed', 
      value: stats.completed, 
      icon: CheckCircle2, 
      gradient: 'from-emerald-400 to-teal-500',
      trend: '+8%'
    },
    { 
      label: 'Success Rate', 
      value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) + '%' : '0%', 
      icon: TrendingUp, 
      gradient: 'from-indigo-500 to-purple-500',
    },
  ]

  // Filtrage par recherche
  const filteredDocuments = documents.filter(doc => 
    doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white p-8 sm:p-12 lg:p-16">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-medium">AI Document Intelligence</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Transform Your Documents Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300">
              Actionable Insights
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl leading-relaxed">
            Upload any document and let our AI extract key information, summarize content, and answer your questions instantly.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="group relative px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-2xl shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Plus size={24} />
              </div>
              <span className="relative">{showUpload ? 'Close' : 'Upload Document'}</span>
            </button>

            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
              <Search size={20} />
              Learn More
            </button>
          </div>
        </div>

        {/* Floating Cards Effect */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 space-y-4">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-64 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 animate-float"
              style={{ animationDelay: `${i * 0.5}s`, transform: `translateX(${i * 20}px)` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20" />
                <div className="flex-1 h-3 bg-white/20 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/10 rounded w-3/4" />
                <div className="h-2 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </section>

      {/* Upload Zone */}
      {showUpload && (
        <section className="animate-in">
          <div className="card-elevated p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Document</h2>
                <p className="text-slate-500">Support for PDF, Word, Images, and Text files up to 50MB</p>
              </div>
            </div>
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          </div>
        </section>
      )}

      {/* Filters & Controls */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-20 z-30 bg-slate-50/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 transition-all"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { setIsRefreshing(true); fetchDocuments(); }}
            disabled={isRefreshing}
            className="p-2.5 hover:bg-white rounded-xl text-slate-500 hover:text-indigo-600 transition-all disabled:opacity-50 border border-transparent hover:border-slate-200"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={20} />
          </button>
        </div>
      </section>

      {/* Documents Grid */}
      {loading && documents.length === 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card-premium p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="skeleton w-14 h-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              </div>
              <div className="skeleton h-20 rounded-lg" />
              <div className="flex gap-2">
                <div className="skeleton h-8 w-20 rounded-full" />
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <FileText className="w-16 h-16 text-slate-300" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center animate-bounce">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to experience AI-powered analysis'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Upload size={20} />
              Upload Your First Document
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredDocuments.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDelete}
              index={index}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}