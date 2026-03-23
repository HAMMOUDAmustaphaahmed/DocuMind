import { useState, useRef, useEffect } from 'react'
import { 
  Send, Loader2, Bot, User, Sparkles, Lightbulb, 
  Clock, CheckCircle2, Copy, RotateCcw 
} from 'lucide-react'
import { askQuestion } from '../utils/api'

const DEFAULT_SUGGESTIONS = [
  'What is the main purpose of this document?',
  'Extract all dates and deadlines mentioned',
  'What are the key financial figures?',
  'Who are the parties involved?',
  'Summarize the important clauses',
  'Are there any risks or warnings?',
]

export default function ChatBox({ docId, suggestedQuestions = [] }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I've analyzed your document thoroughly. I can answer questions about dates, amounts, parties, clauses, or any specific details you need. What would you like to know?",
      timestamp: new Date(),
      id: 'welcome'
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const suggestions = suggestedQuestions.length > 0 ? suggestedQuestions : DEFAULT_SUGGESTIONS

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (question) => {
    const q = (question || input).trim()
    if (!q || loading) return

    const userMessage = { 
      role: 'user', 
      content: q, 
      timestamp: new Date(),
      id: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setShowSuggestions(false)
    setLoading(true)

    try {
      const res = await askQuestion(docId, q)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.answer,
        timestamp: new Date(),
        id: Date.now() + 1
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${err.message}. Please try again or rephrase your question.`,
        error: true,
        timestamp: new Date(),
        id: Date.now() + 1
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = (content, id) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const clearChat = () => {
    setMessages([messages[0]])
    setShowSuggestions(true)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div 
            key={msg.id || i} 
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                <Bot size={14} className="text-white" />
              </div>
            )}
            
            <div className={`max-w-[85%] space-y-1`}>
              <div className={`
                relative px-4 py-3 rounded-2xl text-sm leading-relaxed group
                ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md shadow-lg shadow-indigo-500/20'
                  : msg.error
                  ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-md'
                  : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }
              `}>
                {msg.content}
                
                {/* Copy button for assistant messages */}
                {msg.role === 'assistant' && !msg.error && (
                  <button
                    onClick={() => copyMessage(msg.content, msg.id)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    {copiedId === msg.id ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} className="text-slate-400" />
                    )}
                  </button>
                )}
              </div>
              <p className={`text-[10px] ${msg.role === 'user' ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start animate-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length === 1 && (
        <div className="px-4 py-4 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
            <Lightbulb size={12} className="text-amber-500" />
            <span className="font-medium">Suggested questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-left shadow-sm hover:shadow-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document..."
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`
              px-4 py-3 rounded-xl flex items-center justify-center transition-all
              ${input.trim() && !loading
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-slate-400">
            Powered by <span className="font-semibold text-indigo-500">Groq LLaMA 3</span> • AI-generated responses
          </p>
          {messages.length > 1 && (
            <button 
              onClick={clearChat}
              className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={10} />
              Clear chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}