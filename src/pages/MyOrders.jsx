import React, { useMemo } from 'react'

function readLastOrder(){
  try{ return JSON.parse(localStorage.getItem('lastOrder')||'null') }catch(e){ return null }
}

export default function MyOrders(){
  const lastOrder = useMemo(()=> readLastOrder(), [])

  return (
    <div className="myorders-page container">
      <h2>My Orders</h2>
      {!lastOrder ? (
        <div className="empty-orders">
          <p>You have no orders yet.</p>
          <a href="/shop" className="btn">Start shopping</a>
        </div>
      ) : (
        <div className="orders-list">
          <div className="order-card">
            <div className="order-header">
              <div className="order-id">Order #{lastOrder.id}</div>
              <div className="order-date">{new Date(lastOrder.created).toLocaleDateString()}</div>
            </div>

            <div className="order-details">
              <h3>Items</h3>
              {lastOrder.items && lastOrder.items.length > 0 ? (
                <div className="order-items">
                  {lastOrder.items.map((it, idx)=> (
                    <div key={idx} className="order-item">
                      <img src={it.thumbnail} alt={it.title} />
                      <div>
                        <div className="oi-title">{it.title}</div>
                        <div className="oi-size">Size: {it.size}</div>
                        <div className="oi-qty">Qty: {it.quantity}</div>
                      </div>
                      <div className="oi-price">${((it.price||0)*(it.quantity||1)).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No items in this order.</p>
              )}
            </div>

            <div className="order-summary">
              <div className="summary-row">Subtotal: <strong>${(lastOrder.subtotal||0).toFixed(2)}</strong></div>
              {lastOrder.shipping && (
                <div className="summary-row">Shipping ({lastOrder.shipping.name}): <strong>${(lastOrder.shipping.cost||0).toFixed(2)}</strong></div>
              )}
              <div className="summary-row total">Total: <strong>${(lastOrder.total||0).toFixed(2)}</strong></div>
            </div>

            {lastOrder.shipping && (
              <div className="order-shipping">
                <h3>Shipping info</h3>
                <p>{lastOrder.shipping.name} ({lastOrder.shipping.eta})</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
