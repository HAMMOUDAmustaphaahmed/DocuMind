import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, File, X, Loader2, CheckCircle2, AlertCircle, 
  FileText, Image, FileType2, Sparkles 
} from 'lucide-react'
import { uploadDocument } from '../utils/api'

const FILE_ICONS = {
  'application/pdf': { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  'image/': { icon: Image, color: 'text-purple-500', bg: 'bg-purple-50' },
  'application/vnd.openxmlformats-officedocument': { icon: FileType2, color: 'text-blue-500', bg: 'bg-blue-50' },
  'text/plain': { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' },
}

function getFileIcon(type) {
  const key = Object.keys(FILE_ICONS).find(k => type?.startsWith(k))
  return FILE_ICONS[key] || { icon: File, color: 'text-indigo-500', bg: 'bg-indigo-50' }
}

export default function UploadZone({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const result = await uploadDocument(selectedFile, (p) => setProgress(p))
      onUploadSuccess(result)
    } catch (err) {
      setError(err.message)
      setUploading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
    setProgress(0)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const fileIcon = selectedFile ? getFileIcon(selectedFile.type) : null

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-2xl shadow-indigo-500/20' 
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30'
          }
          ${selectedFile ? 'p-8' : 'p-12 lg:p-16'}
        `}
      >
        <input {...getInputProps()} />
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
        
        {selectedFile ? (
          <div className="relative flex items-center gap-6 animate-in">
            <div className={`w-20 h-20 rounded-2xl ${fileIcon.bg} flex items-center justify-center flex-shrink-0`}>
              <fileIcon.icon size={40} className={fileIcon.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-lg truncate mb-1">{selectedFile.name}</p>
              <p className="text-sm text-slate-500 mb-4">{formatFileSize(selectedFile.size)}</p>
              
              {uploading && (
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 relative overflow-hidden"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-indigo-600">{progress}% uploaded</span>
                    <span className="text-slate-400">Analyzing with AI...</span>
                  </div>
                </div>
              )}
            </div>
            
            {!uploading && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="p-3 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            )}
            
            {uploading && (
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto animate-float">
                <Upload size={48} className="text-indigo-500" />
              </div>
              {isDragActive && (
                <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 animate-pulse" />
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
                              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-slate-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload your document'}
              </p>
              <p className="text-slate-500 mb-6">
                Drag & drop or click to browse supported files
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'PDF', color: 'bg-red-50 text-red-600 border-red-200' },
                { label: 'DOCX', color: 'bg-blue-50 text-blue-600 border-blue-200' },
                { label: 'Images', color: 'bg-purple-50 text-purple-600 border-purple-200' },
                { label: 'TXT', color: 'bg-slate-50 text-slate-600 border-slate-200' },
              ].map((format) => (
                <span 
                  key={format.label}
                  className={`px-4 py-2 rounded-full text-xs font-bold border ${format.color}`}
                >
                  {format.label}
                </span>
              ))}
            </div>
            
            <p className="text-xs text-slate-400 mt-4">Maximum file size: 50MB</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 animate-in">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold mb-1">Upload failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={clearFile}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && !uploading && (
        <div className="flex gap-4 animate-in">
          <button
            onClick={clearFile}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <X size={20} />
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            Analyze with AI
          </button>
        </div>
      )}
    </div>
  )
}