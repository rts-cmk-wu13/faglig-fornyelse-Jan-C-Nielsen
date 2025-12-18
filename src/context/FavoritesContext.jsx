import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { addFavorite, getFavorites, normalizeProductId, removeFavorite } from '../api/favorites'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }){
  const [token, setToken] = useState(()=> localStorage.getItem('authToken') || '')
  const [favoriteIds, setFavoriteIds] = useState(()=> new Set())
  const [loading, setLoading] = useState(false)
  const [pendingIds, setPendingIds] = useState(()=> new Set())
  const lastTokenRef = useRef(localStorage.getItem('authToken') || '')

  const isAuthed = !!token

  const refresh = useCallback(async ()=>{
    const t = localStorage.getItem('authToken')
    if(!t){
      setFavoriteIds(new Set())
      return
    }

    setLoading(true)
    try{
      const favorites = await getFavorites(t)
      const ids = new Set((favorites || []).map(f => normalizeProductId(f.productId)))
      setFavoriteIds(ids)
    }catch(e){
      // if auth is invalid, just clear local state
      setFavoriteIds(new Set())
    }finally{
      setLoading(false)
    }
  },[])

  useEffect(()=>{
    refresh()

    function onAuthUpdated(){
      const nextToken = localStorage.getItem('authToken') || ''
      if(nextToken !== lastTokenRef.current){
        lastTokenRef.current = nextToken
      }
      setToken(nextToken)
      refresh()
    }

    window.addEventListener('auth-updated', onAuthUpdated)
    window.addEventListener('storage', onAuthUpdated)
    return ()=>{
      window.removeEventListener('auth-updated', onAuthUpdated)
      window.removeEventListener('storage', onAuthUpdated)
    }
  },[refresh])

  const isFavorite = useCallback((productId)=>{
    const pid = normalizeProductId(productId)
    return favoriteIds.has(pid)
  },[favoriteIds])

  const isPending = useCallback((productId)=>{
    const pid = normalizeProductId(productId)
    return pendingIds.has(pid)
  },[pendingIds])

  const toggleFavorite = useCallback(async (productId)=>{
    const t = localStorage.getItem('authToken')
    if(!t) return { requiresLogin: true }

    const pid = normalizeProductId(productId)
    setPendingIds(prev => {
      const next = new Set(prev)
      next.add(pid)
      return next
    })

    const wasFavorite = favoriteIds.has(pid)

    // optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if(wasFavorite) next.delete(pid)
      else next.add(pid)
      return next
    })

    try{
      if(wasFavorite) await removeFavorite(t, pid)
      else await addFavorite(t, pid)
      return { ok: true, isFavorite: !wasFavorite }
    }catch(e){
      // revert
      setFavoriteIds(prev => {
        const next = new Set(prev)
        if(wasFavorite) next.add(pid)
        else next.delete(pid)
        return next
      })
      return { ok: false, error: e?.message || 'Failed to update favorite' }
    }finally{
      setPendingIds(prev => {
        const next = new Set(prev)
        next.delete(pid)
        return next
      })
    }
  },[favoriteIds])

  const value = useMemo(()=>({
    loading,
    isAuthed,
    favoriteProductIds: Array.from(favoriteIds),
    count: favoriteIds.size,
    isFavorite,
    isPending,
    toggleFavorite,
    refresh,
  }),[loading, isAuthed, favoriteIds, isFavorite, isPending, toggleFavorite, refresh])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(){
  const ctx = useContext(FavoritesContext)
  if(!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
