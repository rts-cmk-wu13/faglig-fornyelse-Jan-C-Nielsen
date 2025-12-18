import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

async function fetchProductById(id){
  const res = await fetch(`https://dummyjson.com/products/${encodeURIComponent(id)}`)
  const data = await res.json().catch(()=> null)
  if(!res.ok) return null
  if(!data || !data.id) return null
  return data
}

function FavoriteProductCard({ p }){
  const navigate = useNavigate()
  const { isAuthed, isFavorite, isPending, toggleFavorite } = useFavorites()
  const fav = isFavorite(p.id)
  const pending = isPending(p.id)

  async function onFavClick(e){
    e.preventDefault()
    e.stopPropagation()
    if(!isAuthed){
      navigate('/login')
      return
    }
    const res = await toggleFavorite(p.id)
    if(res?.ok === false && res?.error){
      alert(res.error)
    }
  }

  return (
    <Link to={`/product/${p.id}`} className="product-card-link">
      <div className="product-card">
        <button
          className={`fav-btn ${fav ? 'is-fav' : ''}`}
          type="button"
          onClick={onFavClick}
          disabled={pending}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          title={isAuthed ? (fav ? 'Remove from favorites' : 'Add to favorites') : 'Login to save favorites'}
        >
          {fav ? '♥' : '♡'}
        </button>
        <img src={p.thumbnail || (p.images && p.images[0])} alt={p.title} />
        <div className="product-caption">{p.title}</div>
        <div className="product-price">${p.price}</div>
      </div>
    </Link>
  )
}

export default function Favorites(){
  const navigate = useNavigate()
  const { isAuthed, loading: favLoading, favoriteProductIds, refresh } = useFavorites()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const idsKey = useMemo(()=> (favoriteProductIds || []).join(','), [favoriteProductIds])

  useEffect(()=>{
    if(!isAuthed) return
    refresh()
  },[isAuthed, refresh])

  useEffect(()=>{
    let cancelled = false
    async function load(){
      if(!isAuthed){
        setProducts([])
        return
      }

      const ids = favoriteProductIds || []
      if(ids.length === 0){
        setProducts([])
        return
      }

      setLoading(true)
      try{
        const results = await Promise.all(ids.map(id => fetchProductById(id)))
        if(cancelled) return
        setProducts(results.filter(Boolean))
      }finally{
        if(!cancelled) setLoading(false)
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[idsKey, isAuthed])

  if(!isAuthed){
    return (
      <div className="container">
        <h2>Favorites</h2>
        <p>You need to be logged in to view your favorites.</p>
        <button className="btn" type="button" onClick={()=>navigate('/login')}>Go to login</button>
      </div>
    )
  }

  const busy = favLoading || loading

  return (
    <div className="container">
      <h2>Favorites</h2>
      {busy ? (
        <p>Loading…</p>
      ) : products.length === 0 ? (
        <div>
          <p>No favorites yet.</p>
          <Link className="btn" to="/shop">Browse products</Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => <FavoriteProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  )
}
