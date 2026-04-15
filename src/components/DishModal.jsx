import { useState } from 'react'
import { CATEGORIES, CATEGORY_LABELS, LANGUAGES, ALLERGENS } from '../data.js'

const inputStyle = {
  width: '100%', border: '1.5px solid #e0e0e0', borderRadius: '10px',
  padding: '10px 13px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', boxSizing: 'border-box', color: '#222', transition: 'border 0.2s', background: '#fff',
}
const onFocus = e => (e.target.style.borderColor = '#111')
const onBlur  = e => (e.target.style.borderColor = '#e0e0e0')

function emptyML() {
  return Object.fromEntries(LANGUAGES.map(l => [l.code, '']))
}

function normalizeDish(dish) {
  if (!dish) return null
  return {
    ...dish,
    name: typeof dish.name === 'string' ? Object.fromEntries(LANGUAGES.map(l => [l.code, dish.name])) : dish.name,
    desc: typeof dish.desc === 'string' ? Object.fromEntries(LANGUAGES.map(l => [l.code, dish.desc])) : dish.desc,
    allergens: dish.allergens || [],
  }
}

export default function DishModal({ dish, category, onSave, onClose }) {
  const [form, setForm] = useState(normalizeDish(dish) || {
    name: emptyML(), desc: emptyML(), price: '', available: true, frozen: false, allergens: [],
  })
  const [cat, setCat] = useState(category || CATEGORIES[0])
  const [activeLang, setActiveLang] = useState('it')

  function setML(field, lang, value) {
    setForm(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }))
  }

  function toggleAllergen(id) {
    setForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(id)
        ? prev.allergens.filter(a => a !== id)
        : [...prev.allergens, id],
    }))
  }

  function handleSave() {
    if (!form.name.it?.trim() || !form.price) return
    onSave({ ...form, price: parseFloat(form.price) }, cat)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 32px 80px rgba(0,0,0,0.15)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: '#111' }}>
            {dish ? 'Modifica Piatto' : 'Nuovo Piatto'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        {/* Body scrollabile */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Selettore lingua */}
          <div>
            <label style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Lingua</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setActiveLang(l.code)} style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                  border: `1.5px solid ${activeLang === l.code ? '#111' : '#e8e8e8'}`,
                  background: activeLang === l.code ? '#111' : '#fff',
                  color: activeLang === l.code ? '#fff' : '#555',
                  fontFamily: "'DM Sans', sans-serif",
                }}>{l.flag} {l.label}</button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>
              Nome ({activeLang.toUpperCase()})
            </label>
            <input value={form.name[activeLang] || ''} onChange={e => setML('name', activeLang, e.target.value)}
              placeholder={`Nome in ${LANGUAGES.find(l => l.code === activeLang)?.label}`}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Descrizione */}
          <div>
            <label style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>
              Descrizione ({activeLang.toUpperCase()})
            </label>
            <textarea value={form.desc[activeLang] || ''} onChange={e => setML('desc', activeLang, e.target.value)}
              placeholder="Ingredienti, provenienza..."
              style={{ ...inputStyle, minHeight: '68px', resize: 'vertical' }}
              onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Prezzo + Categoria */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>Prezzo €</label>
              <input type="number" step="0.5" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0.00" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>Categoria</label>
              <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c].it}</option>)}
              </select>
            </div>
          </div>

          {/* Toggle disponibile + surgelato */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { key: 'available', on: 'Disponibile', off: 'Non disponibile' },
              { key: 'frozen',    on: 'Può essere surgelato', off: 'Solo fresco' },
            ].map(({ key, on, off }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))} style={{
                  width: '36px', height: '20px', borderRadius: '10px',
                  background: form[key] ? '#111' : '#ddd', transition: 'background 0.2s',
                  position: 'relative', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: '2px', left: form[key] ? '18px' : '2px',
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
                  {form[key] ? on : off}
                </span>
              </label>
            ))}
          </div>

          {/* Allergeni */}
          <div>
            <label style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
              Allergeni — Reg. UE 1169/2011
              {form.allergens.length > 0 && (
                <span style={{ marginLeft: '8px', color: '#7a5c00', background: '#fff8e1', border: '1px solid #f0d060', borderRadius: '10px', padding: '1px 8px', fontSize: '10px', fontWeight: 600 }}>
                  {form.allergens.length} selezionat{form.allergens.length > 1 ? 'i' : 'o'}
                </span>
              )}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALLERGENS.map(a => {
                const active = form.allergens.includes(a.id)
                return (
                  <button key={a.id} onClick={() => toggleAllergen(a.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '5px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                    border: `1.5px solid ${active ? '#111' : '#e8e8e8'}`,
                    background: active ? '#111' : '#fff',
                    color: active ? '#fff' : '#666',
                    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                  }}>
                    <span>{a.icon}</span> {a.it}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#555' }}>
            Annulla
          </button>
          <button onClick={handleSave} style={{ flex: 2, background: '#111', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#fff', fontWeight: 600 }}>
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}
