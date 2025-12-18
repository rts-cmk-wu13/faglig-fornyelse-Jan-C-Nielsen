import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import CheckoutAddress from './pages/CheckoutAddress'
import CheckoutShipping from './pages/CheckoutShipping'
import CheckoutPayment from './pages/CheckoutPayment'
import CheckoutPaymentPaypal from './pages/CheckoutPaymentPaypal'
import MyOrders from './pages/MyOrders'
import Login from './pages/Login'
import Favorites from './pages/Favorites'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/shop" element={<Shop/>} />
          <Route path="/product/:id" element={<Product/>} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/checkout" element={<CheckoutAddress/>} />
          <Route path="/checkout/shipping" element={<CheckoutShipping/>} />
          <Route path="/checkout/payment" element={<CheckoutPayment/>} />
          <Route path="/checkout/payment/paypal" element={<CheckoutPaymentPaypal/>} />
          <Route path="/my-orders" element={<MyOrders/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/favorites" element={<Favorites/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
