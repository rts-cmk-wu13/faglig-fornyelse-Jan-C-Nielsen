import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function readCart(){
  try{ return JSON.parse(localStorage.getItem('cart')||'[]') }catch(e){ return [] }
}

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Post', cost: 4.99, eta: '3-7 business days' },
  { id: 'express', name: 'Express Courier', cost: 12.99, eta: '1-2 business days' },
  { id: 'overnight', name: 'Overnight', cost: 24.99, eta: 'Next business day' },
  { id: 'pickup', name: 'Local Pickup', cost: 0.00, eta: 'Ready same day' }
]

export default function CheckoutShipping(){
  const navigate = useNavigate()
  const cart = useMemo(()=> readCart(), [])
  const subtotal = cart.reduce((s,it)=> s + (it.price||0)*(it.quantity||1), 0)

  const [selected, setSelected] = useState(()=>{
    try{ const s = JSON.parse(localStorage.getItem('selectedShipping')); return s?.id || 'standard' }catch(e){ return 'standard' }
  })

  function choose(id){
    setSelected(id)
  }

  function continueToAddress(){
    const opt = SHIPPING_OPTIONS.find(o=>o.id===selected) || SHIPPING_OPTIONS[0]
    localStorage.setItem('selectedShipping', JSON.stringify(opt))
    // navigate to payment step
    navigate('/checkout/payment')
  }

  return (
    <div className="checkout-page container">
      <h2>Choose shipping</h2>
      <div className="checkout-grid">
        <section className="shipping-options">
          <h3>Shipping companies</h3>
          <p className="muted">Select one shipping option for your order.</p>
          <ul className="shipping-list">
            {SHIPPING_OPTIONS.map(opt=> (
              <li key={opt.id} className={opt.id===selected? 'shipping-item selected' : 'shipping-item'}>
                <label>
                  <input type="radio" name="shipping" value={opt.id} checked={opt.id===selected} onChange={()=>choose(opt.id)} />
                  <div className="ship-info">
                    <div className="ship-name">{opt.name}</div>
                    <div className="ship-meta">{opt.eta} • ${opt.cost.toFixed(2)}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          <div style={{marginTop:16}}>
            <button className="btn" onClick={continueToAddress} disabled={cart.length===0}>Continue to payment</button>
          </div>
        </section>

        <aside className="checkout-summary">
          <h3>Your cart</h3>
          {cart.length===0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((it, idx)=> (
                <div key={idx} className="summary-item">
                  <img src={it.thumbnail} alt={it.title} />
                  <div>
                    <div className="s-title">{it.title} <small>({it.size})</small></div>
                    <div className="s-qty">Qty: {it.quantity}</div>
                  </div>
                  <div className="s-price">${((it.price||0)*(it.quantity||1)).toFixed(2)}</div>
                </div>
              ))}
              <div className="summary-total">Subtotal <strong>${subtotal.toFixed(2)}</strong></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
