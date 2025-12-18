import React, {useEffect, useMemo, useRef, useState} from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

function Checkbox({label, checked, onChange}){
  return (
    <label className="chk">
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function ProductCard({p}){
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

export default function Shop(){
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const qParam = searchParams.get('q') || ''
  const searchRef = useRef(null)

  const [allProducts, setAllProducts] = useState([])
  const [visibleCount, setVisibleCount] = useState(6)
  const [filters, setFilters] = useState({Itar:false,Kafan:false,Caps:false,Food:false})
  const [sort, setSort] = useState('popular')
  const [query, setQuery] = useState(qParam)

  useEffect(()=>{
    if(qParam !== query) setQuery(qParam)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[qParam])

  useEffect(()=>{
    if(location.state?.focusSearch){
      searchRef.current?.focus()
    }
  },[location.key])

  useEffect(()=>{
    setVisibleCount(6)
  },[filters, sort, query])

  useEffect(()=>{
    fetch('https://dummyjson.com/products?limit=100')
      .then(r=>r.json())
      .then(data=>{
        setAllProducts(data.products || [])
      })
      .catch(()=>setAllProducts([]))
  },[])

  const filtered = useMemo(()=>{
    let items = allProducts.slice()

    const q = (query || '').trim().toLowerCase()
    if(q){
      items = items.filter(p => {
        const text = (
          (p.title || '') + ' ' +
          (p.description || '') + ' ' +
          (p.brand || '') + ' ' +
          (p.category || '')
        ).toLowerCase()
        return text.includes(q)
      })
    }

    // apply simple category-like filters by matching keywords in title or category
    const active = Object.keys(filters).filter(k=>filters[k])
    if(active.length>0){
      items = items.filter(p => {
        const text = (p.title + ' ' + (p.category||'')).toLowerCase()
        return active.some(a => text.includes(a.toLowerCase()))
      })
    }

    // sorting
    if(sort==='popular'){
      items.sort((a,b)=> (b.rating||0) - (a.rating||0))
    } else if(sort==='price-asc'){
      items.sort((a,b)=> a.price - b.price)
    } else if(sort==='price-desc'){
      items.sort((a,b)=> b.price - a.price)
    }

    return items
  },[allProducts, filters, sort, query])

  const shown = filtered.slice(0, visibleCount)

  function toggleFilter(key, val){
    setFilters(f=>({...f,[key]:val}))
  }

  return (
    <div className="shop">
      <div className="shop-header">
        <h2>Shop</h2>
        <p>Find items from our store. Use filters and sorting to refine results.</p>
      </div>

      <div className="shop-controls">
        <div className="shop-left">
          <div className="filters-head">
            <h3>Filters</h3>
            <a href="#" className="clear-filters" onClick={e=>{e.preventDefault(); setFilters({Itar:false,Kafan:false,Caps:false,Food:false})}}>Clear filters</a>
          </div>

          <h4 className="small">Categories</h4>
          <div className="categories-col">
            <Checkbox label="Itar" checked={filters.Itar} onChange={v=>toggleFilter('Itar',v)} />
            <Checkbox label="Kafan" checked={filters.Kafan} onChange={v=>toggleFilter('Kafan',v)} />
            <Checkbox label="Caps" checked={filters.Caps} onChange={v=>toggleFilter('Caps',v)} />
            <Checkbox label="Food" checked={filters.Food} onChange={v=>toggleFilter('Food',v)} />
          </div>
        </div>

        <div className="shop-right">
          <div className="topbar-row">
            <div className="sort-and-show">
              <div className="shop-search">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e=>{
                    const next = e.target.value
                    setQuery(next)
                    const sp = new URLSearchParams(searchParams)
                    if(next.trim()) sp.set('q', next)
                    else sp.delete('q')
                    setSearchParams(sp, { replace: true })
                  }}
                  placeholder="Search products…"
                  aria-label="Search products"
                />
                {query && (
                  <button
                    className="shop-search-clear"
                    type="button"
                    onClick={()=>{
                      setQuery('')
                      const sp = new URLSearchParams(searchParams)
                      sp.delete('q')
                      setSearchParams(sp, { replace: true })
                      searchRef.current?.focus()
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="sort-wrap">
                <label className="sort-label">Sort by</label>
                <select value={sort} onChange={e=>setSort(e.target.value)}>
                  <option value="popular">Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
              <div className="showing">Showing {filtered.length} products</div>
            </div>
          </div>

          <div className="products-grid">
            {shown.map(p=> <ProductCard key={p.id} p={p} />)}
          </div>

          {visibleCount < filtered.length && (
            <div style={{textAlign:'center', marginTop:18}}>
              <button className="btn" onClick={()=>setVisibleCount(c=>c+6)}>Load more products</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
