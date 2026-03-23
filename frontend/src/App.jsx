import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import HomePage from './pages/HomePage'
import DocumentPage from './pages/DocumentPage'
import Navbar from './components/Navbar'

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
)

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/5 via-transparent to-transparent" />
      </div>

      <Navbar />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/" 
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              } 
            />
            <Route 
              path="/document/:id" 
              element={
                <PageTransition>
                  <DocumentPage />
                </PageTransition>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-8 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">
            Powered by <span className="text-indigo-500 font-semibold">Groq</span> · 
            Built with <span className="text-purple-500 font-semibold">React</span> & 
            <span className="text-cyan-500 font-semibold"> Tailwind</span>
          </p>
        </div>
      </footer>
    </div>
  )
}