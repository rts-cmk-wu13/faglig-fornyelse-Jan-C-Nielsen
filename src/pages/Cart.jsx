import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'

function readCart(){
  try{
    return JSON.parse(localStorage.getItem('cart') || '[]')
  }catch(e){
    return []
  }
}

function writeCart(items){
  localStorage.setItem('cart', JSON.stringify(items))
}

export default function Cart(){
  const navigate = useNavigate()
  const [items, setItems] = useState(readCart())

  useEffect(()=>{
    // sync if other tabs change cart
    function onStorage(e){
      if(e.key === 'cart') setItems(readCart())
    }
    window.addEventListener('storage', onStorage)
    // also listen for a custom event when StorageEvent cannot be constructed
    function onCartUpdated(){ setItems(readCart()) }
    window.addEventListener('cart-updated', onCartUpdated)
    return ()=>{
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cart-updated', onCartUpdated)
    }
  },[])

  function updateQty(id, qty){
    const next = items.map(it => it.id === id ? {...it, quantity: qty} : it)
    setItems(next)
    writeCart(next)
  }

  function removeItem(id){
    const next = items.filter(it=> it.id !== id)
    setItems(next)
    writeCart(next)
  }

  function clearCart(){
    setItems([])
    writeCart([])
  }

  const total = items.reduce((s,it)=> s + (it.price || 0) * (it.quantity || 1), 0)

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your Cart</h2>
        <p>{items.length === 0 ? 'Your cart is empty.' : `${items.length} item(s) in your cart.`}</p>
      </div>

      <div className="cart-body">
        <div className="cart-items">
          {items.length === 0 && (
            <div className="cart-empty">No items. Add products from the shop.</div>
          )}

          {items.map(it=> (
            <div className="cart-item" key={it.id}>
              <img src={it.thumbnail || (it.images && it.images[0])} alt={it.title} />
              <div className="ci-info">
                <div className="ci-title">{it.title}</div>
                <div className="ci-vendor">by <strong>{it.brand || 'Unknown'}</strong></div>
                <div className="ci-price">${it.price}</div>
              </div>
              <div className="ci-controls">
                <div className="qty-controls">
                  <button onClick={()=> updateQty(it.id, Math.max(1, (it.quantity||1)-1))}>−</button>
                  <span>{it.quantity || 1}</span>
                  <button onClick={()=> updateQty(it.id, (it.quantity||1)+1)}>+</button>
                </div>
                <button className="remove-btn" onClick={()=> removeItem(it.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
            <div className="summary-box">
            <div className="summary-row"><strong>Subtotal</strong><span>${total.toFixed(2)}</span></div>
            <div className="summary-note">Taxes and shipping calculated at checkout</div>
            <button className="btn checkout" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
            <button className="btn" onClick={clearCart} style={{marginTop:8}}>Clear cart</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
