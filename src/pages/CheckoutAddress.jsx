import React, {useState, useMemo} from 'react'
import { useNavigate } from 'react-router-dom'

function readCart(){
  try{ return JSON.parse(localStorage.getItem('cart')||'[]') }catch(e){ return [] }
}

export default function CheckoutAddress(){
  const navigate = useNavigate()
  const cart = useMemo(()=> readCart(), [])
  const total = cart.reduce((s,it)=> s + (it.price||0)*(it.quantity||1), 0)

  const [form, setForm] = useState({
    name:'', email:'', address:'', city:'', postal:'', country:'', phone:''
  })
  const [error, setError] = useState(null)
  const [placed, setPlaced] = useState(false)

  function handleChange(e){
    const {name, value} = e.target
    setForm(f=>({...f,[name]:value}))
  }

  function placeOrder(e){
    e.preventDefault()
    setError(null)
    // basic validation
    if(!form.name || !form.email || !form.address){
      setError('Please fill in name, email and address')
      return
    }

    const order = {id:Date.now(), items:cart, total, shipping:form, created: new Date().toISOString()}
    localStorage.setItem('lastOrder', JSON.stringify(order))
    localStorage.removeItem('cart')
    // notify cart listeners
    window.dispatchEvent(new Event('cart-updated'))
    setPlaced(true)
    setTimeout(()=> navigate('/'), 1800)
  }

  if(placed) return (
    <div className="checkout-page container">
      <h2>Thank you — your order has been placed</h2>
      <p>We emailed your order confirmation.</p>
    </div>
  )

  return (
    <div className="checkout-page container">
      <h2>Checkout</h2>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={placeOrder}>
          <h3>Shipping information</h3>
          {error && <div className="form-error">{error}</div>}
          <label>Name<input name="name" value={form.name} onChange={handleChange} required/></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required/></label>
          <label>Address<input name="address" value={form.address} onChange={handleChange} required/></label>
          <label>City<input name="city" value={form.city} onChange={handleChange}/></label>
          <label>Postal code<input name="postal" value={form.postal} onChange={handleChange}/></label>
          <label>Country<input name="country" value={form.country} onChange={handleChange}/></label>
          <label>Phone<input name="phone" value={form.phone} onChange={handleChange}/></label>
          <button className="btn" type="button" onClick={() => navigate('/checkout/shipping')}>Continue to shipping</button>
        </form>

        <aside className="checkout-summary">
          <h3>Order summary</h3>
          {cart.length===0 ? <p>Your cart is empty.</p> : (
            <div>
              {cart.map(it=> (
                <div key={it.id} className="summary-item">
                  <img src={it.thumbnail} alt={it.title}/>
                  <div>
                    <div className="s-title">{it.title} <small>({it.size})</small></div>
                    <div className="s-qty">Qty: {it.quantity}</div>
                  </div>
                  <div className="s-price">${((it.price||0)*(it.quantity||1)).toFixed(2)}</div>
                </div>
              ))}
              <div className="summary-total">Total <strong>${total.toFixed(2)}</strong></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
