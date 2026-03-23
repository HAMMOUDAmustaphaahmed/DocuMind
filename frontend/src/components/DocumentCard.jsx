import { useNavigate } from 'react-router-dom'
import { 
  FileText, Trash2, ChevronRight, Globe, Tag, 
  Clock, CheckCircle2, AlertCircle, Sparkles, 
  FileType, FileSpreadsheet, FileImage, FileCode
} from 'lucide-react'
import { useState } from 'react'

const DOC_TYPE_CONFIG = {
  invoice: { 
    gradient: 'from-amber-400 to-orange-500', 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    icon: '💰',
    label: 'Invoice'
  },
  contract: { 
    gradient: 'from-blue-400 to-indigo-500', 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    icon: '📄',
    label: 'Contract'
  },
  cv: { 
    gradient: 'from-purple-400 to-pink-500', 
    bg: 'bg-purple-50', 
    text: 'text-purple-700', 
    icon: '👤',
    label: 'CV/Resume'
  },
  report: { 
    gradient: 'from-teal-400 to-emerald-500', 
    bg: 'bg-teal-50', 
    text: 'text-teal-700', 
    icon: '📊',
    label: 'Report'
  },
  letter: { 
    gradient: 'from-pink-400 to-rose-500', 
    bg: 'bg-pink-50', 
    text: 'text-pink-700', 
    icon: '✉️',
    label: 'Letter'
  },
  identity_card: { 
    gradient: 'from-red-400 to-rose-500', 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    icon: '🪪',
    label: 'ID Card'
  },
  receipt: { 
    gradient: 'from-orange-400 to-amber-500', 
    bg: 'bg-orange-50', 
    text: 'text-orange-700', 
    icon: '🧾',
    label: 'Receipt'
  },
  form: { 
    gradient: 'from-cyan-400 to-blue-500', 
    bg: 'bg-cyan-50', 
    text: 'text-cyan-700', 
    icon: '📝',
    label: 'Form'
  },
  email: { 
    gradient: 'from-indigo-400 to-purple-500', 
    bg: 'bg-indigo-50', 
    text: 'text-indigo-700', 
    icon: '📧',
    label: 'Email'
  },
  other: { 
    gradient: 'from-slate-400 to-gray-500', 
    bg: 'bg-slate-50', 
    text: 'text-slate-700', 
    icon: '📎',
    label: 'Document'
  },
}

const STATUS_CONFIG = {
  processing: { 
    icon: Clock, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50', 
    label: 'Processing',
    animate: true 
  },
  completed: { 
    icon: CheckCircle2, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50', 
    label: 'Analyzed',
    animate: false 
  },
  error: { 
    icon: AlertCircle, 
    color: 'text-red-500', 
    bg: 'bg-red-50', 
    label: 'Error',
    animate: false 
  },
}

export default function DocumentCard({ document, onDelete, index = 0, viewMode = 'grid' }) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${document.filename || document.original_filename}"? This cannot be undone.`)) return
    
    setIsDeleting(true)
    try {
      await onDelete(document.id)
    } catch {
      setIsDeleting(false)
    }
  }

  const handleClick = () => {
    if (!isDeleting) {
      navigate(`/document/${document.id}`)
    }
  }

  const docType = document.doc_type || document.document_type || 'other'
  const typeConfig = DOC_TYPE_CONFIG[docType] || DOC_TYPE_CONFIG.other
  const statusConfig = STATUS_CONFIG[document.status] || STATUS_CONFIG.processing
  
  const date = new Date(document.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  const confidence = document.confidence || 0

  // Vue Liste
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 
          hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer
          ${isDeleting ? 'opacity-50' : 'opacity-100'}
        `}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-xl bg-gradient-to-br ${typeConfig.gradient} 
          flex items-center justify-center shadow-lg flex-shrink-0
          group-hover:scale-110 transition-transform duration-300
        `}>
          <span className="text-2xl">{typeConfig.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
              {document.filename || document.original_filename}
            </h3>
            <span className={`badge ${typeConfig.bg} ${typeConfig.text} border-0`}>
              {typeConfig.label}
            </span>
            <span className={`badge ${statusConfig.bg} ${statusConfig.color}`}>
              <statusConfig.icon size={12} className={statusConfig.animate ? 'animate-spin' : ''} />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate">
            {document.summary || 'No summary available'}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-6 text-sm text-slate-400">
          {document.language && document.language !== 'unknown' && (
            <span className="flex items-center gap-1">
              <Globe size={14} />
              {document.language.toUpperCase()}
            </span>
          )}
          <span>{date}</span>
          {confidence > 0 && document.status === 'completed' && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    confidence > 0.8 ? 'bg-emerald-500' : confidence > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium w-8">{Math.round(confidence * 100)}%</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    )
  }

  // Vue Grille (par défaut)
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden bg-white rounded-2xl border border-slate-100 
        shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 
        hover:-translate-y-1 hover:border-indigo-200 
        transition-all duration-300 cursor-pointer
        ${isDeleting ? 'opacity-50 scale-95' : 'opacity-100'}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient Border Effect */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${typeConfig.gradient} opacity-0 
        group-hover:opacity-5 transition-opacity duration-300 rounded-2xl
      `} />

      {/* AI Glow Effect for completed docs */}
      {document.status === 'completed' && (
        <div className={`
          absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${typeConfig.gradient} 
          rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500
        `} />
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Icon */}
          <div className={`
            w-14 h-14 rounded-2xl bg-gradient-to-br ${typeConfig.gradient} 
            flex items-center justify-center shadow-lg shadow-indigo-500/20
            group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
          `}>
            <span className="text-2xl">{typeConfig.icon}</span>
          </div>

          {/* Title & Type */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate pr-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {document.filename || document.original_filename}
            </h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`badge ${typeConfig.bg} ${typeConfig.text}`}>
                <Tag size={10} />
                {typeConfig.label}
              </span>
              
              <span className={`badge ${statusConfig.bg} ${statusConfig.color}`}>
                <statusConfig.icon size={10} className={statusConfig.animate ? 'animate-spin' : ''} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Summary */}
        {document.summary && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {document.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {document.language && document.language !== 'unknown' && (
              <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                <Globe size={12} />
                {document.language.toUpperCase()}
              </span>
            )}
            <span className="bg-slate-50 px-2 py-1 rounded-lg">{date}</span>
          </div>

          <div className="flex items-center gap-3">
            {confidence > 0 && document.status === 'completed' && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      confidence > 0.8 ? 'bg-emerald-500' : confidence > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.round(confidence * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
            
            <ChevronRight 
              size={20} 
              className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" 
            />
          </div>
        </div>

        {/* AI Badge */}
        {document.status === 'completed' && (
          <div className={`
            absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500
            flex items-center justify-center shadow-lg
            ${isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
            transition-all duration-300
          `}>
            <Sparkles size={14} className="text-white" />
          </div>
        )}
      </div>
    </div>
  )
}