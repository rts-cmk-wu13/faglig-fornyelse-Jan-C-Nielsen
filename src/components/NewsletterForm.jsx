import React, {useState} from 'react'

export default function NewsletterForm(){
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setStatus('Please enter a valid email address.')
      return
    }
    if(!username){
      setStatus('Please enter a username.')
      return
    }
    if(!password || password.length < 6){
      setStatus('Password must be at least 6 characters.')
      return
    }

    try{
      setLoading(true)
      setStatus(null)
      const payload = { email, username, password }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if(!res.ok){
        let msg = `Signup failed (${res.status})`
        try{
          const data = await res.json()
          msg = data?.message || data?.error || msg
        }catch(e){
          // ignore
        }
        setStatus(`${msg} — /api/auth/signup`)
        return
      }

      try{
        const data = await res.json()
        if(data?.token) localStorage.setItem('authToken', data.token)
      }catch(e){
        // ignore
      }

      setStatus('Account created successfully!')
      setEmail('')
      setUsername('')
      setPassword('')
    }catch(err){
      setStatus('Signup failed. Is the API running on http://localhost:3000 ?')
    }finally{
      setLoading(false)
    }
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className="newsletter-row">
        <input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
      </div>

      <div className="newsletter-row" style={{marginTop:8}}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e=>setUsername(e.target.value)}
          required
        />
      </div>

      <div className="newsletter-row" style={{marginTop:8}}>
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
      </div>

      {status && <div className="newsletter-status" role="status">{status}</div>}
    </form>
  )
}
