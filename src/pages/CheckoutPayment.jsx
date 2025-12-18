import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentMethodToggle from '../components/PaymentMethodToggle'

function readCart(){
  try{ return JSON.parse(localStorage.getItem('cart')||'[]') }catch(e){ return [] }
}

export default function CheckoutPayment(){
  const navigate = useNavigate()
  const cart = useMemo(()=> readCart(), [])
  const subtotal = cart.reduce((s,it)=> s + (it.price||0)*(it.quantity||1), 0)

  const selectedShipping = (()=>{
    try{ return JSON.parse(localStorage.getItem('selectedShipping')||'null') }catch(e){ return null }
  })()
  const shippingCost = selectedShipping?.cost || 0
  const total = subtotal + shippingCost

  const [form, setForm] = useState({
    cardName:'', cardNumber:'', expiry:'', cvv:'', billingAddress:''
  })
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [placed, setPlaced] = useState(false)

  function handleChange(e){
    const {name, value} = e.target
    setForm(f=>({...f,[name]:value}))
  }

  function placePayment(e){
    e.preventDefault()
    setError(null)
    if(cart.length===0){ setError('Your cart is empty'); return }
    if(!form.cardName || !form.cardNumber || !form.expiry || !form.cvv){
      setError('Please fill in all card fields')
      return
    }
    setProcessing(true)
    // simulate payment processing
    setTimeout(()=>{
      const order = {
        id: Date.now(),
        items: cart,
        subtotal,
        shipping: selectedShipping || null,
        payment: { cardName: form.cardName.replace(/.(?=.{4})/g, '*') },
        total,
        created: new Date().toISOString()
      }
      localStorage.setItem('lastOrder', JSON.stringify(order))
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cart-updated'))
      setPlaced(true)
      setProcessing(false)
      setTimeout(()=> navigate('/'), 1600)
    }, 900)
  }

  if(placed) return (
    <div className="checkout-page container">
      <h2>Payment successful</h2>
      <p>Thank you! Your order was placed and we'll email confirmation shortly.</p>
    </div>
  )

  return (
    <div className="checkout-page container">
      <h2>Payment</h2>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={placePayment}>
          <PaymentMethodToggle initial="creditcard" />
          <h3>Payment details</h3>
          {error && <div className="form-error">{error}</div>}
          <label>Cardholder name<input name="cardName" value={form.cardName} onChange={handleChange} required/></label>
          <label>Card number<input name="cardNumber" value={form.cardNumber} onChange={handleChange} required/></label>
          <label>Expiry<input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" required/></label>
          <label>CVV<input name="cvv" value={form.cvv} onChange={handleChange} required/></label>
          <label>Billing address<input name="billingAddress" value={form.billingAddress} onChange={handleChange}/></label>
          <div style={{marginTop:12}}>
            <button className="btn" type="submit" disabled={processing}>Place order — ${total.toFixed(2)}</button>
          </div>
        </form>

        <aside className="checkout-summary">
          <h3>Order summary</h3>
          {cart.length===0 ? <p>Your cart is empty.</p> : (
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
