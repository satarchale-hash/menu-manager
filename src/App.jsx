import { useState } from 'react'
import { menu as initialMenu, CATEGORIES, CATEGORY_LABELS, LANGUAGES, ALLERGENS } from './data.js'
import DishModal from './components/DishModal.jsx'

let nextId = 1000
const LANG = 'it'

function t(field) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[LANG] ?? ''
}

// ── Riga piatto ─────────────────────────────────────────────
function DishRow({ dish, onEdit, onDelete, onToggle, showCategory, categoryLabel }) {
  const dishAllergens = (dish.allergens || [])
    .map(id => ALLERGENS.find(a => a.id === id))
    .filter(Boolean)

  return (
    <div style={{
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px',
      padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)', opacity: dish.available ? 1 : 0.5,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Nome + badge */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 600, color: '#111' }}>
            {t(dish.name)}
          </span>
          {dish.frozen && <span style={{ fontSize: '10px', color: '#aaa', fontFamily: 'monospace' }}>❄</span>}
          {!dish.available && (
            <span style={{ fontSize: '10px', background: '#f5f5f5', color: '#bbb', borderRadius: '4px', padding: '2px 7px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              non disp.
            </span>
          )}
          {showCategory && categoryLabel && (
            <span style={{ fontSize: '11px', color: '#ccc', fontFamily: 'monospace' }}>{categoryLabel}</span>
          )}
        </div>

        {/* Descrizione */}
        {t(dish.desc) && (
          <div style={{ fontSize: '13px', color: '#999', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t(dish.desc)}
          </div>
        )}

        {/* Allergeni */}
        {dishAllergens.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '7px' }}>
            {dishAllergens.map(a => (
              <span key={a.id} title={a.it} style={{
                fontSize: '11px', background: '#fff8e1', color: '#7a5c00',
                border: '1px solid #f0d060', borderRadius: '4px',
                padding: '2px 7px', fontFamily: "'DM Sans', sans-serif",
                display: 'inline-flex', alignItems: 'center', gap: '3px',
              }}>
                {a.icon} {a.it}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Prezzo + azioni */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 700, color: '#111' }}>
          €{dish.price.toFixed(2)}{dish.priceNote ? dish.priceNote.it : ''}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => onToggle(dish.id)} title={dish.available ? 'Rendi non disponibile' : 'Rendi disponibile'}
            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dish.available ? '⏸' : '▶'}
          </button>
          <button onClick={() => onEdit(dish)}
            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✏️
          </button>
          <button onClick={() => onDelete(dish.id, t(dish.name))}
            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #fce4ec', background: '#fff5f7', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pulsante aggiungi ────────────────────────────────────────
function AddBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: 'transparent', border: '2px dashed #e0e0e0', borderRadius: '16px', padding: '14px', cursor: 'pointer', fontSize: '13px', color: '#bbb', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#111'; e.currentTarget.style.background = '#fafafa' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#bbb'; e.currentTarget.style.background = 'transparent' }}>
      + {label}
    </button>
  )
}

// ── App ─────────────────────────────────────────────────────
export default function App() {
  const [menu, setMenu]                     = useState(initialMenu)
  const [customCategories, setCustomCats]   = useState([])
  const [activeTab, setActiveTab]           = useState('categorie')
  const [activeCategory, setActiveCat]      = useState('antipasti')
  const [editingDish, setEditingDish]       = useState(null)
  const [isNew, setIsNew]                   = useState(false)
  const [search, setSearch]                 = useState('')
  const [allergenFilter, setAllergenFilter] = useState(null)
  const [newCatName, setNewCatName]         = useState('')
  const [toast, setToast]                   = useState(null)

  const allCats  = [...CATEGORIES, ...customCategories.filter(c => !CATEGORIES.includes(c))]
  const allItems = allCats.flatMap(cat => (menu[cat] || []).map(d => ({ ...d, _cat: cat })))
  const unavailableCount = allItems.filter(d => !d.available).length
  const availableCount   = allItems.length - unavailableCount

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2800) }

  function saveDish(dish, category) {
    setMenu(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      if (!isNew) {
        for (const cat of Object.keys(next)) next[cat] = next[cat].filter(d => d.id !== dish.id)
      }
      const newDish = isNew ? { ...dish, id: `custom-${nextId++}` } : dish
      if (!next[category]) next[category] = []
      const idx = next[category].findIndex(d => d.id === newDish.id)
      if (idx >= 0) next[category][idx] = newDish
      else next[category].push(newDish)
      return next
    })
    setActiveCat(category)
    setEditingDish(null)
    setIsNew(false)
    showToast(isNew ? `"${t(dish.name)}" aggiunto!` : `"${t(dish.name)}" aggiornato!`)
  }

  function deleteDish(id, name) {
    setMenu(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      for (const cat of Object.keys(next)) next[cat] = next[cat].filter(d => d.id !== id)
      return next
    })
    showToast(`"${name}" rimosso.`)
  }

  function toggleAvailability(id) {
    setMenu(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      for (const cat of Object.keys(next)) {
        const idx = (next[cat] || []).findIndex(d => d.id === id)
        if (idx >= 0) { next[cat][idx].available = !next[cat][idx].available; break }
      }
      return next
    })
  }

  function addCategory() {
    const name = newCatName.trim()
    if (!name) return
    const key = name.toLowerCase().replace(/\s+/g, '_')
    if (menu[key]) { showToast('Categoria già esistente.'); return }
    setMenu(prev => ({ ...prev, [key]: [] }))
    setCustomCats(prev => [...prev, key])
    setNewCatName('')
    showToast(`Categoria "${name}" aggiunta.`)
  }

  function removeCategory(key) {
    if ((menu[key] || []).length > 0) { showToast('Svuota prima la categoria.'); return }
    setMenu(prev => { const next = { ...prev }; delete next[key]; return next })
    setCustomCats(prev => prev.filter(c => c !== key))
    if (activeCategory === key) setActiveCat('antipasti')
    showToast('Categoria rimossa.')
  }

  function filterItems(items) {
    return items.filter(d => {
      if (search) {
        const q = search.toLowerCase()
        if (!t(d.name).toLowerCase().includes(q) && !t(d.desc).toLowerCase().includes(q)) return false
      }
      if (allergenFilter && !(d.allergens || []).includes(allergenFilter)) return false
      return true
    })
  }

  const editingCategory = editingDish
    ? allCats.find(cat => (menu[cat] || []).some(d => d.id === editingDish.id)) || activeCategory
    : activeCategory

  const dishRowProps = dish => ({
    dish,
    onEdit:   d => { setEditingDish(d); setIsNew(false) },
    onDelete: deleteDish,
    onToggle: toggleAvailability,
  })

  const tabs = [
    { key: 'totali',          label: 'Totali',          value: allItems.length,        icon: '🍽️' },
    { key: 'categorie',       label: 'Categorie',        value: allCats.filter(c => (menu[c]||[]).length > 0).length, icon: '📂' },
    { key: 'non-disponibili', label: 'Non disponibili',  value: unavailableCount,       icon: '⏸️' },
    { key: 'disponibili',     label: 'Disponibili',      value: availableCount,         icon: '✓'  },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '12px 22px', borderRadius: '40px', fontSize: '13px', fontWeight: 500, zIndex: 2000, boxShadow: '0 8px 30px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* DishModal */}
      {(isNew || editingDish) && (
        <DishModal
          dish={isNew ? null : editingDish}
          category={editingCategory}
          onSave={saveDish}
          onClose={() => { setEditingDish(null); setIsNew(false) }}
        />
      )}

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 32px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px', gap: '20px' }}>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 700, color: '#111' }}>
              Ristorante L'Approdo
            </span>
            <span style={{ fontSize: '11px', color: '#bbb', fontFamily: 'monospace', marginLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Gestione Menu
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {/* Ricerca */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: '14px' }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cerca piatto o ingrediente..."
              style={{ border: '1.5px solid #ebebeb', borderRadius: '30px', padding: '8px 14px 8px 32px', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans', sans-serif", width: '260px', transition: 'all 0.2s', background: '#fafafa', color: '#333' }}
              onFocus={e => { e.target.style.borderColor = '#111'; e.target.style.width = '300px' }}
              onBlur={e => { e.target.style.borderColor = '#ebebeb'; e.target.style.width = '260px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 32px' }}>

        {/* ── Filtro allergeni ── */}
        <div style={{ marginBottom: '18px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px', flexShrink: 0 }}>
            Filtra per allergene:
          </span>
          {ALLERGENS.map(a => (
            <button key={a.id} onClick={() => setAllergenFilter(allergenFilter === a.id ? null : a.id)} style={{
              padding: '3px 9px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer',
              border: `1.5px solid ${allergenFilter === a.id ? '#7a5c00' : '#e8e8e8'}`,
              background: allergenFilter === a.id ? '#fff8e1' : '#fff',
              color: allergenFilter === a.id ? '#7a5c00' : '#888',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
              display: 'inline-flex', alignItems: 'center', gap: '3px',
            }}>
              {a.icon} {a.it}
            </button>
          ))}
          {allergenFilter && (
            <button onClick={() => setAllergenFilter(null)} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', border: '1.5px solid #fce4ec', background: '#fff5f7', color: '#c62828', fontFamily: "'DM Sans', sans-serif" }}>
              ✕ rimuovi filtro
            </button>
          )}
        </div>

        {/* ── Tab cards ── */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
          {tabs.map(tab => {
            const active = activeTab === tab.key
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearch('') }} style={{
                background: '#fff', border: '1.5px solid #f0f0f0',
                borderBottom: active ? '3px solid #111' : '1.5px solid #f0f0f0',
                borderRadius: '14px', padding: active ? '16px 20px 14px' : '16px 20px', flex: 1,
                boxShadow: active ? '0 4px 20px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
              }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{tab.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 700, color: '#111', lineHeight: 1 }}>{tab.value}</div>
                <div style={{ fontSize: '11px', color: active ? '#555' : '#aaa', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: active ? 600 : 400 }}>{tab.label}</div>
              </button>
            )
          })}
        </div>

        {/* ══ TOTALI ══ */}
        {activeTab === 'totali' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filterItems(allItems).map(dish => (
              <DishRow key={dish.id} {...dishRowProps(dish)} showCategory categoryLabel={CATEGORY_LABELS[dish._cat]?.it || dish._cat} />
            ))}
            <AddBtn label="Aggiungi piatto" onClick={() => { setIsNew(true); setEditingDish(null) }} />
          </div>
        )}

        {/* ══ CATEGORIE ══ */}
        {activeTab === 'categorie' && (
          <>
            {/* Sub-tab */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {allCats.map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)} style={{
                  background: '#fff', color: activeCategory === cat ? '#111' : '#888',
                  border: '1.5px solid #ebebeb',
                  borderBottom: activeCategory === cat ? '2.5px solid #111' : '1.5px solid #ebebeb',
                  borderRadius: '20px', padding: activeCategory === cat ? '6px 16px 5px' : '6px 16px',
                  fontSize: '13px', fontWeight: activeCategory === cat ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: activeCategory === cat ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                }}>
                  {CATEGORY_LABELS[cat]?.it || cat}
                  <span style={{ marginLeft: '6px', fontSize: '11px', color: activeCategory === cat ? '#666' : '#ccc' }}>
                    {(menu[cat] || []).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Piatti categoria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filterItems(menu[activeCategory] || []).map(dish => (
                <DishRow key={dish.id} {...dishRowProps(dish)} />
              ))}
              <AddBtn label={`Aggiungi piatto a ${CATEGORY_LABELS[activeCategory]?.it || activeCategory}`} onClick={() => { setIsNew(true); setEditingDish(null) }} />
            </div>

            {/* Gestione categorie */}
            <div style={{ marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
              <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Gestisci categorie</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="Nuova categoria..."
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  style={{ flex: 1, border: '1.5px solid #e8e8e8', borderRadius: '8px', padding: '9px 13px', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans', sans-serif", color: '#222' }}
                  onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#e8e8e8'}
                />
                <button onClick={addCategory} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {customCategories.length === 0
                  ? <span style={{ fontSize: '12px', color: '#ccc', fontFamily: 'monospace' }}>Nessuna categoria personalizzata</span>
                  : customCategories.map(cat => (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f5f5', borderRadius: '20px', padding: '5px 12px 5px 14px', fontSize: '13px', color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
                      {cat}
                      <button onClick={() => removeCategory(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '14px', padding: 0, lineHeight: 1 }}>✕</button>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}

        {/* ══ DISPONIBILI / NON DISPONIBILI ══ */}
        {(activeTab === 'disponibili' || activeTab === 'non-disponibili') && (() => {
          const showAvail = activeTab === 'disponibili'
          const listed  = filterItems(allItems.filter(d => d.available === showAvail))
          const others  = allItems.filter(d => d.available !== showAvail)

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {listed.length === 0 && (
                <div style={{ textAlign: 'center', color: '#ccc', padding: '40px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}>
                  Nessun piatto {showAvail ? 'disponibile' : 'non disponibile'}
                </div>
              )}
              {listed.map(dish => (
                <DishRow key={dish.id} {...dishRowProps(dish)} showCategory categoryLabel={CATEGORY_LABELS[dish._cat]?.it || dish._cat} />
              ))}

              {others.length > 0 && (
                <div style={{ marginTop: '16px', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                    Sposta da {showAvail ? 'non disponibili' : 'disponibili'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {others.map(dish => (
                      <div key={dish.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#555' }}>{t(dish.name)}</span>
                        <span style={{ fontSize: '12px', color: '#ccc', fontFamily: 'monospace' }}>{CATEGORY_LABELS[dish._cat]?.it || dish._cat}</span>
                        <button onClick={() => toggleAvailability(dish.id)} style={{
                          background: '#111', color: '#fff', border: 'none', borderRadius: '7px',
                          padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, whiteSpace: 'nowrap',
                        }}>
                          {showAvail ? '▶ Rendi disponibile' : '⏸ Rendi non disp.'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AddBtn label="Aggiungi piatto" onClick={() => { setIsNew(true); setEditingDish(null) }} />
            </div>
          )
        })()}

      </div>
    </div>
  )
}
