import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

export default function Header(){
  const navigate = useNavigate()
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem('authToken'))
  const { count } = useFavorites()

  useEffect(()=>{
    function sync(){
      setIsAuthed(!!localStorage.getItem('authToken'))
    }
    window.addEventListener('storage', sync)
    window.addEventListener('auth-updated', sync)
    return ()=>{
      window.removeEventListener('storage', sync)
      window.removeEventListener('auth-updated', sync)
    }
  },[])

  function logout(){
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.dispatchEvent(new Event('auth-updated'))
    navigate('/')
  }

  return (
    <>
      <div className="site-topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">USD</div>
          <div className="topbar-center">FREE SHIPPING ON ALL HERMAN MILLER! FEB. 25–28.</div>
          <div className="topbar-right">Support</div>
        </div>
      </div>

      <nav className="site-nav" aria-label="Main navigation">
        <div className="container nav-inner">
          <ul className="nav-left">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/favorites">Favorites{count ? ` (${count})` : ''}</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
          <ul className="nav-right">
            <li><Link to="/shop" state={{ focusSearch: true }}><span className="nav-icon" aria-hidden="true">🔍</span>Search</Link></li>
            <li><Link to="/favorites"><span className="nav-icon" aria-hidden="true">♥</span>Favorites</Link></li>
            <li>
              {isAuthed ? (
                <button className="nav-action-btn" type="button" onClick={logout}>Logout</button>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </li>
          </ul>
        </div>
      </nav>

   
    </>
  )
}
