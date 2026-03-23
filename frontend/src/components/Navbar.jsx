import { Link, useLocation } from 'react-router-dom'
import { FileSearch, Sparkles, Zap, Home, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-500/5' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-110 transition-all duration-300">
                <FileSearch size={20} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              <div className="absolute inset-0 rounded-xl bg-indigo-500 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                DocuMind
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                AI Powered
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {/* AI Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <Zap size={14} className="text-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">Groq LLaMA 3</span>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />

            {/* Nav Links */}
            <Link 
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isHome 
                  ? 'bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-500/10' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
              }`}
            >
              {isHome ? <Sparkles size={16} className="text-indigo-500" /> : <Home size={16} />}
              <span className="hidden sm:inline">Documents</span>
            </Link>

            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">New</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}