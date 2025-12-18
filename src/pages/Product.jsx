import React, {useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

export default function Product(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthed, isFavorite, isPending, toggleFavorite } = useFavorites()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    setLoading(true)
    setError(null)
    fetch(`https://dummyjson.com/products/${id}`)
      .then(r=>r.json())
      .then(data=>{
        if(data.id){
          setProduct(data)
        } else {
          setError('Product not found')
        }
      })
      .catch(e=>{
        setError(e.message)
      })
      .finally(()=>setLoading(false))
  },[id])

  if(loading) return <div className="product-page"><p>Loading...</p></div>
  if(error) return <div className="product-page"><p>Error: {error}</p></div>
  if(!product) return <div className="product-page"><p>Product not found</p></div>

  const fav = isFavorite(product.id)
  const pendingFav = isPending(product.id)

  async function onFavClick(){
    if(!isAuthed){
      navigate('/login')
      return
    }
    const res = await toggleFavorite(product.id)
    if(res?.ok === false && res?.error){
      alert(res.error)
    }
  }

  // Get 4 images (use the first 4 from the product, or repeat the thumbnail)
  const images = product.images && product.images.length > 0 
    ? product.images.slice(0, 4)
    : [product.thumbnail, product.thumbnail, product.thumbnail, product.thumbnail]

  const addToCart = () => {
    try{
      const key = 'cart'
      const raw = localStorage.getItem(key)
      const cart = raw ? JSON.parse(raw) : []

      // find existing entry by product id and size
      const existingIndex = cart.findIndex(it => it.id === product.id && it.size === selectedSize)
      if(existingIndex >= 0){
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + quantity
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail || (product.images && product.images[0]),
          brand: product.brand,
          size: selectedSize,
          quantity: quantity
        })
      }

      localStorage.setItem(key, JSON.stringify(cart))
      // dispatch storage event so same-window listeners update
      try{
        window.dispatchEvent(new StorageEvent('storage', {key: key, newValue: JSON.stringify(cart)}))
      }catch(e){
        // older browsers may not allow constructor — fall back to custom event
        window.dispatchEvent(new Event('cart-updated'))
      }

      // small feedback then navigate to cart
      alert(`${quantity} × "${product.title}" (Size: ${selectedSize}) added to cart`)
      navigate('/cart')
    }catch(e){
      console.error('Failed to add to cart', e)
      alert('Could not add to cart')
    }
  }

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-images">
          <div className="image-grid">
            {images.map((img, idx)=> (
              <img key={idx} src={img} alt={`${product.title} ${idx+1}`} />
            ))}
          </div>
        </div>

        <div className="product-info">
          <div className="product-title-row">
            <h1 className="product-name">{product.title}</h1>
            <button
              className={`fav-btn fav-btn-large ${fav ? 'is-fav' : ''}`}
              type="button"
              onClick={onFavClick}
              disabled={pendingFav}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              title={isAuthed ? (fav ? 'Remove from favorites' : 'Add to favorites') : 'Login to save favorites'}
            >
              {fav ? '♥' : '♡'}
            </button>
          </div>
          
          <div className="product-price">${product.price}</div>
          
          <p className="product-description">{product.description}</p>
          
          <div className="product-vendor">by <strong>{product.brand || 'Unknown Brand'}</strong></div>
          
          <div className="size-section">
            <h3>Size</h3>
            <div className="size-buttons">
              {['S', 'M', 'L'].map(sz=> (
                <button 
                  key={sz}
                  className={`size-btn ${selectedSize===sz?'active':''}`}
                  onClick={()=>setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="add-to-cart-row">
            <button className="add-to-cart-btn" onClick={addToCart}>
              Add to cart - ${product.price}
            </button>
            <div className="quantity-selector">
              <button onClick={()=>setQuantity(Math.max(1, quantity-1))}>−</button>
              <span>{quantity}</span>
              <button onClick={()=>setQuantity(quantity+1)}>+</button>
            </div>
          </div>
          <div className="product-shipping">
            <small>Free standard shipping&nbsp;&nbsp;&nbsp; Free Returns</small>
          </div>
        </div>
      </div>
    </div>
  )
}
