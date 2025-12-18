import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'

function Carousel(){
  const slides = [
    'https://picsum.photos/seed/1/1200/400',
    'https://picsum.photos/seed/2/1200/400',
    'https://picsum.photos/seed/3/1200/400'
  ]
  const [i, setI] = useState(0)
  useEffect(()=>{
    const t = setInterval(()=> setI(n => (n+1)%slides.length), 3000)
    return ()=> clearInterval(t)
  },[])
  function prev(){ setI(n => (n-1+slides.length)%slides.length) }
  function next(){ setI(n => (n+1)%slides.length) }

  return (
    <div className="carousel">
      <button className="arrow left" onClick={prev} aria-label="Previous slide">‹</button>
      <img src={slides[i]} alt={`slide ${i+1}`} />
      <button className="arrow right" onClick={next} aria-label="Next slide">›</button>
    </div>
  )
}

function ThreeGrid({items}){
  return (
    <div className="three-grid">
      {items.map((it, idx)=> (
        <div className="card" key={idx}>
          <img src={it.src} alt={it.caption} />
          <div className="card-caption">{it.caption}</div>
          {it.price !== undefined && <div className="card-price">${it.price}</div>}
        </div>
      ))}
    </div>
  )
}

export default function Home(){
  const [latest, setLatest] = useState([])

  useEffect(()=>{
    // fetch 3 products from dummyjson for "Our latest arrivals"
    fetch('https://dummyjson.com/products?limit=3')
      .then(r=>r.json())
      .then(data=>{
        const items = (data.products||[]).map(p=>({src: p.thumbnail || (p.images && p.images[0]) || 'https://picsum.photos/seed/p/400/300', caption: p.title, price: p.price}))
        setLatest(items)
      })
      .catch(()=>{
        setLatest([
          {src:'https://picsum.photos/seed/la1/400/300', caption:'Product 1', price:99},
          {src:'https://picsum.photos/seed/la2/400/300', caption:'Product 2', price:99},
          {src:'https://picsum.photos/seed/la3/400/300', caption:'Product 3', price:99}
        ])
      })
  },[])

  const categories = [
    {src:'https://picsum.photos/seed/food/400/300', caption:'Food'},
    {src:'https://picsum.photos/seed/itar/400/300', caption:'Itar'},
    {src:'https://picsum.photos/seed/tasbeeh/400/300', caption:'Tasbeeh'}
  ]

  const products = [
    {src:'https://picsum.photos/seed/jae/400/300', caption:'Jae Namaz', price:99},
    {src:'https://picsum.photos/seed/dates/400/300', caption:'Dates', price:99},
    {src:'https://picsum.photos/seed/miswak/400/300', caption:'Miswak', price:99}
  ]

  return (
    <div className="home">
      <Carousel/>

      <section className="section">
        <h2>Categories</h2>
        <p>Discover our curated categories to find what you need.</p>
        <Link to="/shop" className="btn">Shop All</Link>
        <ThreeGrid items={categories} />
      </section>

      <section className="section">
        <h2>Our latest arrivals</h2>
        <p>Freshly added items chosen for you.</p>
        <Link to="/shop" className="btn">Shop All</Link>
        <ThreeGrid items={latest} />
      </section>

      <section className="section">
        <h2>Our Products</h2>
        <p>Explore our range of popular and essential products.</p>
        <Link to="/shop" className="btn">Shop All</Link>
        <ThreeGrid items={products} />
      </section>
    </div>
  )
}
