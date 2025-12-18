import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentMethodToggle from '../components/PaymentMethodToggle'

function readCart(){
  try{ return JSON.parse(localStorage.getItem('cart')||'[]') }catch(e){ return [] }
}

const PAYPAL_INFO = {
  help: 'You will be redirected to PayPal to complete the payment. This demo simulates the flow.',
  supportEmail: 'support@example.com'
}

export default function CheckoutPaymentPaypal(){
  const navigate = useNavigate()
  const cart = useMemo(()=> readCart(), [])
  const subtotal = cart.reduce((s,it)=> s + (it.price||0)*(it.quantity||1), 0)
  const selectedShipping = (()=>{
    try{ return JSON.parse(localStorage.getItem('selectedShipping')||'null') }catch(e){ return null }
  })()
  const shippingCost = selectedShipping?.cost || 0
  const total = subtotal + shippingCost

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')

  function payWithPaypal(){
    setError(null)
    if(cart.length===0){ setError('Your cart is empty'); return }
    if(!email || !cardNumber){ setError('Please enter Email and Card Number'); return }
    setProcessing(true)
    // Simulate redirect + payment: create an order and clear cart
    setTimeout(()=>{
      try{
        const order = {
          id: 'PP-' + Date.now(),
          items: cart,
          subtotal,
          shipping: selectedShipping || null,
          payment: { method: 'paypal', tx: 'SIM-' + Math.floor(Math.random()*900000+100000) },
          total,
          created: new Date().toISOString()
        }
        localStorage.setItem('lastOrder', JSON.stringify(order))
        localStorage.removeItem('cart')
        window.dispatchEvent(new Event('cart-updated'))
        setProcessing(false)
        navigate('/')
      }catch(e){
        setProcessing(false)
        setError('Payment failed (simulated).')
      }
    }, 900)
  }

  return (
    <div className="checkout-page container">
      <h2>Pay with PayPal</h2>
      <div className="checkout-grid">
        <section className="checkout-form">
          <PaymentMethodToggle initial="paypal" />
          <h3>Payment details</h3>
          <p className="muted">{PAYPAL_INFO.help}</p>
          <p>Support: <a href={`mailto:${PAYPAL_INFO.supportEmail}`}>{PAYPAL_INFO.supportEmail}</a></p>
          {error && <div className="form-error">{error}</div>}
          <label>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          </label>
          <label>
            <input placeholder="Card Number" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} />
          </label>
          <div style={{marginTop:12}}>
            <button className="btn" onClick={payWithPaypal} disabled={processing}>{processing? 'Processing…' : 'Pay Now'}</button>
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
              <div className="summary-total">Shipping <strong>${shippingCost.toFixed(2)}</strong></div>
              <div className="summary-total">Total <strong>${total.toFixed(2)}</strong></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
