import { useState, useEffect, useRef } from 'react'
import { CATEGORY_LABELS, CATEGORIES, ALLERGENS, RESTAURANT, LANGUAGES } from './data.js'
import { fetchMenu } from './api.js'

const LANG_KEY = 'approdo_lang'

function t(field, lang) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] ?? field['it'] ?? ''
}

const GOLD = '#C9A84C'
const GOLD_LIGHT = '#E8C97A'
const DARK = '#0a0a0a'
const DARK2 = '#141414'
const DARK3 = '#1e1e1e'
const BORDER = 'rgba(201,168,76,0.25)'

// ── Selettore lingua ────────────────────────────────────────
function LangSelector({ lang, onChange }) {
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === lang)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '20px',
        padding: '6px 14px', color: GOLD, fontSize: '13px', cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'border-color 0.2s',
      }}>
        {current?.flag} {current?.label} ▾
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '38px', right: 0, background: DARK2,
          border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden',
          zIndex: 100, minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { onChange(l.code); setOpen(false) }} style={{
              width: '100%', padding: '10px 16px', background: l.code === lang ? DARK3 : 'transparent',
              border: 'none', color: l.code === lang ? GOLD : '#aaa', fontSize: '13px',
              cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: '8px',
              borderBottom: `1px solid rgba(255,255,255,0.05)`,
            }}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Riga allergene ──────────────────────────────────────────
function AllergenBadge({ id, lang }) {
  const a = ALLERGENS.find(x => x.id === id)
  if (!a) return null
  return (
    <span title={t(a, lang)} style={{
      fontSize: '10px', color: 'rgba(201,168,76,0.7)', border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: '4px', padding: '1px 6px', fontFamily: "'DM Sans', sans-serif",
      display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap',
    }}>
      {a.icon} {t(a, lang)}
    </span>
  )
}

// ── Piatto ──────────────────────────────────────────────────
function DishCard({ dish, lang }) {
  const name = t(dish.name, lang)
  const desc = t(dish.desc, lang)
  const allergens = dish.allergens || []

  return (
    <div style={{
      padding: '20px 0', borderBottom: `1px solid ${BORDER}`,
      display: 'flex', alignItems: 'flex-start', gap: '16px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600,
            color: '#f5f0e8', letterSpacing: '0.02em', lineHeight: 1.2,
          }}>
            {name}
          </span>
          {dish.frozen && (
            <span style={{ fontSize: '10px', color: 'rgba(201,168,76,0.5)', fontFamily: 'monospace' }}>*</span>
          )}
        </div>
        {desc && (
          <div style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '5px',
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, fontStyle: 'italic',
          }}>
            {desc}
          </div>
        )}
        {allergens.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {allergens.map(id => <AllergenBadge key={id} id={id} lang={lang} />)}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600,
        color: GOLD, flexShrink: 0, letterSpacing: '0.02em',
      }}>
        €{dish.price.toFixed(2)}{dish.priceNote ? dish.priceNote[lang] || dish.priceNote.it : ''}
      </div>
    </div>
  )
}

// ── Categoria ───────────────────────────────────────────────
function CategorySection({ catKey, dishes, lang, isActive }) {
  const ref = useRef(null)
  return (
    <section ref={ref} id={`cat-${catKey}`} style={{ marginBottom: '48px' }}>
      {/* Titolo categoria */}
      <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', fontWeight: 400,
          color: GOLD, textTransform: 'uppercase', letterSpacing: '4px', whiteSpace: 'nowrap',
        }}>
          {t(CATEGORY_LABELS[catKey], lang)}
        </h2>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
      </div>

      {/* Piatti */}
      <div>
        {dishes.map(dish => <DishCard key={dish.id} dish={dish} lang={lang} />)}
      </div>

      {/* Nota surgelati */}
      {dishes.some(d => d.frozen) && (
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '12px', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
          * {t(RESTAURANT.frozenNote, lang)}
        </div>
      )}
    </section>
  )
}

// ── Vista cliente principale ────────────────────────────────
export default function CustomerMenu() {
  const [menu, setMenu] = useState({})
  const [menuLoading, setMenuLoading] = useState(true)
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'it')
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const [showAllergenInfo, setShowAllergenInfo] = useState(false)

  useEffect(() => {
    fetchMenu().then(data => {
      if (Object.keys(data).length > 0) setMenu(data)
      setMenuLoading(false)
    }).catch(() => setMenuLoading(false))
  }, [])

  useEffect(() => { localStorage.setItem(LANG_KEY, lang) }, [lang])

  // Solo categorie con piatti disponibili
  const visibleCats = CATEGORIES.filter(cat => (menu[cat] || []).some(d => d.available))

  if (menuLoading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: 'rgba(201,168,76,0.6)' }}>
      L'Approdo
    </div>
  )

  function scrollToCategory(catKey) {
    setActiveCategory(catKey)
    const el = document.getElementById(`cat-${catKey}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Etichette UI localizzate
  const ui = {
    cover:    { it: 'Coperto', fr: 'Couvert', de: 'Gedeck', en: 'Cover charge', es: 'Cubierto' },
    allergen: { it: 'Allergeni', fr: 'Allergènes', de: 'Allergene', en: 'Allergens', es: 'Alérgenos' },
    allergenTitle: { it: 'Informazioni sugli allergeni', fr: 'Informations sur les allergènes', de: 'Allergeninformationen', en: 'Allergen information', es: 'Información sobre alérgenos' },
    close:    { it: 'Chiudi', fr: 'Fermer', de: 'Schließen', en: 'Close', es: 'Cerrar' },
  }

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: '#f5f0e8', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header fisso ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `linear-gradient(to bottom, ${DARK} 80%, transparent)`,
        padding: '16px 24px 0',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            {/* Logo / Nome */}
            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 700,
                color: GOLD, letterSpacing: '0.05em',
              }}>
                L'Approdo
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(201,168,76,0.5)', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '1px' }}>
                Calasetta · Sardegna
              </div>
            </div>
            {/* Azioni header */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setShowAllergenInfo(true)} style={{
                background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '20px',
                padding: '6px 12px', color: 'rgba(201,168,76,0.7)', fontSize: '12px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                ⓘ {t(ui.allergen, lang)}
              </button>
              <LangSelector lang={lang} onChange={setLang} />
            </div>
          </div>

          {/* Nav categorie */}
          <nav style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '0', scrollbarWidth: 'none' }}>
            {visibleCats.map(cat => (
              <button key={cat} onClick={() => scrollToCategory(cat)} style={{
                background: 'transparent', border: 'none', borderBottom: `2px solid ${activeCategory === cat ? GOLD : 'transparent'}`,
                padding: '8px 16px', color: activeCategory === cat ? GOLD : 'rgba(255,255,255,0.4)',
                fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', textTransform: 'uppercase',
                transition: 'all 0.2s', fontWeight: activeCategory === cat ? 600 : 400,
              }}>
                {t(CATEGORY_LABELS[cat], lang)}
              </button>
            ))}
          </nav>
          {/* Separatore oro */}
          <div style={{ height: '1px', background: BORDER, marginBottom: '0' }} />
        </div>
      </header>

      {/* ── Hero / Citazione ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <blockquote style={{
          textAlign: 'center', fontFamily: "'Cormorant Garamond', serif",
          fontSize: '16px', fontStyle: 'italic', color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.8, borderLeft: 'none', margin: '0 0 8px',
        }}>
          {t(RESTAURANT.quote, lang)}
        </blockquote>
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(201,168,76,0.5)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          — {RESTAURANT.quoteAuthor}
        </div>

        {/* Avviso cucina espressa */}
        <div style={{
          marginTop: '32px', padding: '16px 20px', border: `1px solid ${BORDER}`,
          borderRadius: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center',
        }}>
          {t(RESTAURANT.notice, lang)}
        </div>

        {/* Coperto */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'rgba(201,168,76,0.6)', letterSpacing: '1px' }}>
          {t(ui.cover, lang)} € {RESTAURANT.coverCharge.toFixed(2)}
        </div>
      </div>

      {/* ── Divisore decorativo ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1, height: '1px', background: BORDER }} />
        <div style={{ color: GOLD, fontSize: '18px', opacity: 0.5 }}>✦</div>
        <div style={{ flex: 1, height: '1px', background: BORDER }} />
      </div>

      {/* ── Menu ── */}
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
        {visibleCats.map(cat => (
          <CategorySection
            key={cat}
            catKey={cat}
            dishes={(menu[cat] || []).filter(d => d.available)}
            lang={lang}
            isActive={activeCategory === cat}
          />
        ))}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center', padding: '32px 24px',
        borderTop: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.2)',
        fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
      }}>
        <div style={{ color: GOLD, fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', marginBottom: '8px', opacity: 0.6 }}>
          L'Approdo
        </div>
        {t(RESTAURANT.allergenNote, lang)}
      </footer>

      {/* ── Modale allergeni ── */}
      {showAllergenInfo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
          zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '20px',
        }} onClick={() => setShowAllergenInfo(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: DARK2, border: `1px solid ${BORDER}`, borderRadius: '20px',
            width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: GOLD }}>
                {t(ui.allergenTitle, lang)}
              </span>
              <button onClick={() => setShowAllergenInfo(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', lineHeight: 1.6, fontStyle: 'italic' }}>
                {t(RESTAURANT.allergenNote, lang)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ALLERGENS.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                    <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{a.icon}</span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>{t(a, lang)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
