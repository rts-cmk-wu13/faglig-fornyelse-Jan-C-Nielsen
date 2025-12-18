import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaymentMethodToggle({ initial = 'creditcard' }){
  const navigate = useNavigate()
  const [selected, setSelected] = useState(initial)

  function select(method){
    setSelected(method)
    if(method === 'paypal') navigate('/checkout/payment/paypal')
    else navigate('/checkout/payment')
  }

  return (
    <div className="pm-toggle" role="radiogroup" aria-label="Payment method">
      <button
        type="button"
        className={`pm-btn ${selected==='paypal' ? 'selected' : ''}`}
        aria-checked={selected==='paypal'}
        onClick={() => select('paypal')}
      >
        PayPal
      </button>

      <button
        type="button"
        className={`pm-btn ${selected==='creditcard' ? 'selected' : ''}`}
        aria-checked={selected==='creditcard'}
        onClick={() => select('creditcard')}
      >
        Creditcard
      </button>
    </div>
  )
}
