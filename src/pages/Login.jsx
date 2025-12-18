import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e){
    e.preventDefault()
    setError(null)
    if(!email || !password){
      setError('Email and password are required')
      return
    }

    try{
      setLoading(true)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(()=> ({}))

      if(!res.ok){
        setError(data?.error || data?.message || `Login failed (${res.status})`)
        return
      }

      if(data?.token) localStorage.setItem('authToken', data.token)
      if(data?.user) localStorage.setItem('authUser', JSON.stringify(data.user))
      window.dispatchEvent(new Event('auth-updated'))
      navigate('/')
    }catch(err){
      setError('Login failed. Is the API running on http://localhost:3000 ?')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="checkout-page container">
      <h2>Login</h2>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={onSubmit}>
          {error && <div className="form-error">{error}</div>}
          <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
          <div style={{marginTop:12}}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
          </div>
          <div style={{marginTop:10, color:'#555'}}>
            No account? Use the footer signup form.
          </div>
        </form>

        <aside className="checkout-summary">
          <h3>Account</h3>
          <p>After login you can view <Link to="/my-orders">My Orders</Link>.</p>
        </aside>
      </div>
    </div>
  )
}
