function authHeaders(token){
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function normalizeProductId(productId){
  return String(productId)
}

export async function getFavorites(token){
  const res = await fetch('/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(()=> ({}))
  if(!res.ok) throw new Error(data?.error || data?.message || `Failed to load favorites (${res.status})`)
  return data?.favorites || []
}

export async function addFavorite(token, productId){
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId: normalizeProductId(productId) }),
  })
  const data = await res.json().catch(()=> ({}))
  if(!res.ok) throw new Error(data?.error || data?.message || `Failed to add favorite (${res.status})`)
  return data
}

export async function removeFavorite(token, productId){
  const pid = encodeURIComponent(normalizeProductId(productId))
  const res = await fetch(`/api/favorites/${pid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(()=> ({}))
  if(!res.ok) throw new Error(data?.error || data?.message || `Failed to remove favorite (${res.status})`)
  return data
}

export async function checkFavorite(token, productId){
  const pid = encodeURIComponent(normalizeProductId(productId))
  const res = await fetch(`/api/favorites/check/${pid}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(()=> ({}))
  if(!res.ok) throw new Error(data?.error || data?.message || `Failed to check favorite (${res.status})`)
  return !!data?.isFavorite
}

export { normalizeProductId }
