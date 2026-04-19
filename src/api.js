// ============================================================
// API client — risto-approdo backend
// ============================================================

export const API_URL = 'https://risto-approdo.duckdns.org:3001'

export async function fetchMenu() {
  const res = await fetch(`${API_URL}/menu`)
  if (!res.ok) throw new Error('Errore nel caricamento del menu')
  return res.json()
}

export async function saveMenu(menuData) {
  const res = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuData),
  })
  if (!res.ok) throw new Error('Errore nel salvataggio del menu')
  return res.json()
}
