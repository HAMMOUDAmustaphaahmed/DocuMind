import { 
  Calendar, DollarSign, User, Hash, AlertTriangle, 
  Briefcase, MapPin, Phone, Mail, Building2, FileCheck 
} from 'lucide-react'

const ENTITY_ICONS = {
  dates: { icon: Calendar, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  amounts: { icon: DollarSign, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  names: { icon: User, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  organizations: { icon: Building2, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  locations: { icon: MapPin, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  emails: { icon: Mail, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
  phones: { icon: Phone, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  key_fields: { icon: Hash, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
}

function EntitySection({ type, items }) {
  const config = ENTITY_ICONS[type] || ENTITY_ICONS.key_fields
  const Icon = config.icon
  
  if (!items || items.length === 0) return null

  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 capitalize">{type.replace('_', ' ')}</h3>
          <p className="text-xs text-slate-500">{items.length} found</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span 
            key={i} 
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              ${config.bg} ${config.text} border ${config.border}
              hover:shadow-md hover:scale-105 transition-all cursor-default
            `}
          >
            {type === 'amounts' && <span className="text-xs opacity-50">$</span>}
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function KeyFieldsSection({ fields }) {
  if (!fields || Object.keys(fields).length === 0) return null

  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
          <FileCheck size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Key Information</h3>
          <p className="text-xs text-slate-500">{Object.keys(fields).length} fields</p>
        </div>
      </div>
      
      <div className="grid gap-3">
        {Object.entries(fields).map(([key, val]) => (
          <div 
            key={key} 
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group/item"
          >
            <span className="text-sm font-medium text-slate-500 capitalize flex items-center gap-2">
              <Hash size={14} className="text-slate-400 group-hover/item:text-indigo-500" />
              {key.replace(/_/g, ' ')}
            </span>
            <span className="text-sm font-bold text-slate-900 text-right max-w-[60%] truncate">
              {String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnomaliesSection({ anomalies }) {
  if (!anomalies || anomalies.length === 0) return null

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center animate-pulse">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900">Anomalies Detected</h3>
          <p className="text-xs text-amber-700">{anomalies.length} issues found</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {anomalies.map((anomaly, i) => (
          <div 
            key={i} 
            className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200 shadow-sm"
          >
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">{anomaly}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EntitiesPanel({ entities, anomalies }) {
  if (!entities) return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <FileCheck className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-500">No entities detected in this document.</p>
    </div>
  )

  const hasEntities = Object.values(entities).some(arr => arr?.length > 0) || 
                      Object.keys(entities.key_fields || {}).length > 0

  if (!hasEntities) return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <FileCheck className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-500">No structured entities detected.</p>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {['dates', 'amounts', 'names', 'organizations', 'locations', 'emails', 'phones'].map((type) => (
          entities[type]?.length > 0 && (
            <EntitySection key={type} type={type} items={entities[type]} />
          )
        ))}
      </div>

      {entities.key_fields && Object.keys(entities.key_fields).length > 0 && (
        <KeyFieldsSection fields={entities.key_fields} />
      )}

      <AnomaliesSection anomalies={anomalies} />
    </div>
  )
}