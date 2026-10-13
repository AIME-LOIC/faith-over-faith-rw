import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Cross, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react'
import './styles.css'

const products = [
  { id: 1, name: 'Psalm 23 Graphic Tee', category: 'T-Shirts', drop: 'DROP 002', price: 15000, color: 'White', image: '/images/psalm-tee.jpg', fallback: 'Psalm 23', description: 'A graphic tee inspired by Psalm 23. Designed to make your faith part of your everyday uniform.' },
  { id: 2, name: 'Faith Over Fear Tee', category: 'T-Shirts', drop: 'DROP 002', price: 15000, color: 'Black', image: '/images/faith-tee.jpg', fallback: 'F>F', description: 'The signature message, printed for everyday wear. Simple, bold, and built around belief.' },
  { id: 3, name: 'Jesus Walks Tee', category: 'T-Shirts', drop: 'DROP 002', price: 18000, color: 'Black', image: '/images/jesus-walks-tee.jpg', fallback: 'JESUS WALKS', description: 'A statement graphic from the Faith Over Fear collection.' },
  { id: 4, name: 'Scripture Backprint Tee', category: 'T-Shirts', drop: 'DROP 001', price: 18000, color: 'Black', image: '/images/scripture-tee.jpg', fallback: 'WALK BY FAITH', description: 'A bold back-print design inspired by scripture and street culture.' },
  { id: 5, name: 'Color of Grace Tee', category: 'T-Shirts', drop: 'DROP 002', price: 15000, color: 'White', image: '/images/color-grace-tee.jpg', fallback: 'GRACE', description: 'A colorful graphic print on a clean white tee.' },
  { id: 6, name: 'Faith Essentials Hoodie', category: 'Hoodies', drop: 'DROP 001', price: 28000, color: 'Black', image: '/images/faith-hoodie.jpg', fallback: 'F>F HOODIE', description: 'A relaxed everyday hoodie carrying the F>F identity.' },
]
const money = value => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(value).replace('RWF', 'FRW')

function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const addToCart = (product, size = 'M') => {
    setCart(current => {
      const found = current.find(item => item.id === product.id && item.size === size)
      return found ? current.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, size, quantity: 1 }]
    })
    setActiveProduct(null)
    setCartOpen(true)
  }
  const changeQuantity = (id, size, delta) => setCart(items => items.map(item => item.id === id && item.size === size ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0))
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shop = () => { navigate('/shop'); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <>
    <div className="announcement"><span>FAITH FIRST. FEAR LESS.</span><span className="announcement-right">DESIGNED IN RWANDA <span className="dot">●</span> WORN EVERYWHERE</span></div>
    <header className="header">
      <button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      <Link to="/" className="wordmark" aria-label="Faith Over Fear home"><span>F&gt;F</span><small>FAITH OVER FEAR RW</small></Link>
      <nav className={mobileOpen ? 'nav nav-open' : 'nav'}>
        <Link onClick={() => setMobileOpen(false)} to="/">Home</Link>
        <Link onClick={() => setMobileOpen(false)} to="/shop">Shop all</Link>
        <Link onClick={() => { setMobileOpen(false); navigate('/shop?drop=002') }} to="/drops">Latest drop <span className="nav-new">NEW</span></Link>
        <a href="/#story" onClick={() => setMobileOpen(false)}>Our story</a>
        <a href="/#custom" onClick={() => setMobileOpen(false)}>Custom prints</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button search-trigger" aria-label="Search products" onClick={() => setSearchOpen(!searchOpen)}><Search size={20}/></button>
        <button className="icon-button account-trigger" aria-label="Account" onClick={() => setAuthOpen(true)}><span className="account-symbol">↗</span></button>
        <button className="icon-button bag-button" aria-label="Open shopping bag" onClick={() => setCartOpen(true)}><ShoppingBag size={20}/><span className="bag-count">{cartCount}</span></button>
      </div>
    </header>
    {searchOpen && <div className="search-bar"><Search size={18}/><input autoFocus placeholder="Search tees, hoodies, scripture..." value={query} onChange={e => setQuery(e.target.value)}/><button className="text-button" onClick={() => { setSearchOpen(false); navigate('/shop') }}>View results <ArrowRight size={15}/></button><button className="icon-button" onClick={() => {setSearchOpen(false);setQuery('')}}><X size={18}/></button></div>}
    <Routes>
      <Route path="/" element={<Home onShop={shop} onProduct={setActiveProduct} onAdd={addToCart} />} />
      <Route path="/shop" element={<Shop category={category} setCategory={setCategory} query={query} onProduct={setActiveProduct} onAdd={addToCart} />} />
      <Route path="/drops" element={<Shop category={category} setCategory={setCategory} query={query} onProduct={setActiveProduct} onAdd={addToCart} dropOnly />} />
      <Route path="/login" element={<AuthPage onOpen={() => setAuthOpen(true)} />} />
      <Route path="*" element={<Home onShop={shop} onProduct={setActiveProduct} onAdd={addToCart} />} />
    </Routes>
    <Footer onLogin={() => setAuthOpen(true)}/>

    {cartOpen && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setCartOpen(false)}><aside className="drawer">
      <div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>Your bag <span className="muted">({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)}><X/></button></div>
      {cart.length === 0 ? <div className="empty-state"><ShoppingBag size={32}/><h3>Your bag is empty.</h3><p>Find a piece that speaks to you.</p><button className="button button-dark" onClick={() => {setCartOpen(false);shop()}}>Explore the collection <ArrowRight size={16}/></button></div> :
        <><div className="cart-items">{cart.map(item => <div className="cart-item" key={`${item.id}-${item.size}`}><ProductVisual product={item}/><div className="cart-info"><h3>{item.name}</h3><p>{item.color} · Size {item.size}</p><strong>{money(item.price)}</strong><div className="quantity"><button onClick={() => changeQuantity(item.id,item.size,-1)}><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id,item.size,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={() => changeQuantity(item.id,item.size,-item.quantity)}>Remove</button></div>)}</div>
        <div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><p>Delivery and payment options are confirmed at checkout.</p><button className="button button-dark full" onClick={() => alert('Concept preview only: secure checkout and MTN MoMo will be connected after backend setup.')}>Continue to checkout <ArrowRight size={16}/></button><button className="continue-link" onClick={() => setCartOpen(false)}>Continue shopping</button></div></>}
    </aside></div>}
    {activeProduct && <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} onAdd={addToCart}/>}
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={() => {setAuthOpen(false);navigate('/account')}}/>}
  </>
}

function Home({ onShop, onProduct, onAdd }) {
  return <main>
    <section className="hero">
      <div className="hero-image" role="img" aria-label="Monochrome streetwear campaign"><div className="hero-grain"/></div>
      <div className="hero-content">
        <span className="eyebrow hero-eyebrow"><span className="live-dot"/> DROP 002 — AVAILABLE NOW</span>
        <h1>WEAR WHAT<br/>YOU <em>BELIEVE.</em></h1>
        <p>Faith is more than a feeling.<br/>It's how you show up.</p>
        <button className="button button-light" onClick={onShop}>Shop the collection <ArrowRight size={17}/></button>
        <div className="hero-footnote"><span>01 / 03</span><span>FAITH · STYLE · COMMUNITY</span></div>
      </div>
      <div className="hero-side-label">FAITH OVER FEAR RW — KIGALI</div>
    </section>
    <section className="ticker" aria-label="Brand values"><div className="ticker-track">{Array.from({length:4},(_,i)=><span key={i}>FAITH OVER FEAR <Cross size={15}/> MADE TO MAKE A STATEMENT <Cross size={15}/> RWANDA TO THE WORLD <Cross size={15}/></span>)}</div></section>
    <section className="section featured-section" id="shop">
      <div className="section-heading"><div><span className="eyebrow">THE CURRENT ROTATION / 002</span><h2>Latest <em>drop.</em></h2></div><button className="underlined-link" onClick={onShop}>Shop all pieces <ArrowUpRight size={17}/></button></div>
      <ProductGrid products={products.slice(0,4)} onProduct={onProduct} onAdd={onAdd}/>
    </section>
    <section className="manifesto" id="story">
      <div className="manifesto-image"><div className="image-caption">BUILT ON BELIEF — SINCE DAY ONE</div></div>
      <div className="manifesto-copy"><span className="eyebrow">MORE THAN WHAT YOU WEAR</span><h2>Belief is the<br/>real <em>statement.</em></h2><p>Faith Over Fear is for people who move with purpose. We bring faith, street culture, and personal expression together through graphic tees and wearable messages.</p><a className="underlined-link" href="#custom">Get to know us <ArrowUpRight size={17}/></a><div className="manifesto-number">F&gt;F <span>EST. RWANDA</span></div></div>
    </section>
    <section className="custom-section" id="custom"><div className="custom-content"><span className="eyebrow">YOUR IDEA. YOUR MESSAGE.</span><h2>Make it <em>personal.</em></h2><p>Need custom tees for your crew, event, or next big idea? Let's put your vision on fabric.</p><a className="button button-light" href="https://www.instagram.com/faithoverfear.rw__/" target="_blank" rel="noreferrer">Talk custom printing <ArrowUpRight size={16}/></a></div><div className="custom-stamp">PRINT<br/>YOUR<br/>PURPOSE<span>F&gt;F</span></div></section>
    <section className="newsletter"><div><span className="eyebrow">STAY IN THE LOOP</span><h2>First to know.<br/><em>First to wear.</em></h2></div><Newsletter/></section>
  </main>
}

function Shop({ category, setCategory, query, onProduct, onAdd, dropOnly=false }) {
  const [sort, setSort] = useState('Featured')
  const [localSearch, setLocalSearch] = useState(query || '')
  const [mobileFilter, setMobileFilter] = useState(false)
  const cats = ['All', 'T-Shirts', 'Hoodies']
  const visible = useMemo(() => {
    let list = products.filter(p => (category === 'All' || p.category === category) && (!dropOnly || p.drop === 'DROP 002') && `${p.name} ${p.category} ${p.drop} ${p.description}`.toLowerCase().includes(localSearch.toLowerCase()))
    if (sort === 'Price: low to high') list = [...list].sort((a,b) => a.price-b.price)
    if (sort === 'Price: high to low') list = [...list].sort((a,b) => b.price-a.price)
    return list
  }, [category, dropOnly, localSearch, sort])
  return <main className="shop-page">
    <div className="shop-intro"><span className="eyebrow">FAITH OVER FEAR RW / SHOP</span><h1>{dropOnly ? <>The latest <em>drop.</em></> : <>Wear your <em>belief.</em></>}</h1><p>Pieces with purpose. Find the design that speaks to you.</p><div className="breadcrumbs"><a href="/">HOME</a><span>/</span><span>{dropOnly ? 'DROP 002' : 'ALL PRODUCTS'}</span></div></div>
    <div className="shop-toolbar"><button className="filter-toggle" onClick={() => setMobileFilter(!mobileFilter)}>Categories <ChevronDown size={16}/></button><div className={mobileFilter ? 'category-tabs tabs-open' : 'category-tabs'}>{cats.map(cat => <button key={cat} className={category === cat ? 'category-tab active' : 'category-tab'} onClick={() => {setCategory(cat);setMobileFilter(false)}}>{cat}</button>)}</div><div className="shop-controls"><label className="shop-search"><Search size={16}/><input value={localSearch} onChange={e=>setLocalSearch(e.target.value)} placeholder="Find a piece"/></label><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products"><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select></div></div>
    <div className="shop-count"><span>{visible.length} PIECES</span><span>DROP 001 — 002</span></div>
    {visible.length ? <ProductGrid products={visible} onProduct={onProduct} onAdd={onAdd}/> : <div className="empty-products"><Search size={30}/><h2>No pieces found.</h2><p>Try another search or category.</p><button className="button button-dark" onClick={()=>{setCategory('All');setLocalSearch('')}}>Clear filters</button></div>}
    <div className="shop-note"><Cross size={16}/><span>Designed with purpose. Made to be worn.</span></div>
  </main>
}

function ProductVisual({ product, className='' }) {
  return <div className={`product-visual ${className}`}>
    <img src={product.image} alt={product.name} onError={e=>{e.currentTarget.style.display='none';e.currentTarget.nextSibling.style.display='flex'}}/>
    <div className="product-placeholder"><span className="placeholder-logo">F&gt;F</span><span className="placeholder-art">{product.fallback}</span><small>FAITH OVER FEAR RW</small></div>
    <span className="product-drop">{product.drop}</span>
  </div>
}
function ProductGrid({ products: list, onProduct, onAdd }) {
  return <div className="product-grid">{list.map((product,index)=><article className="product-card" key={product.id}>
    <button className="product-image-button" onClick={()=>onProduct(product)} aria-label={`View ${product.name}`}><ProductVisual product={product}/><span className="quick-view">Quick view <ArrowUpRight size={15}/></span></button>
    <div className="product-meta"><div><span className="product-category">{product.category} / {product.color}</span><h3>{product.name}</h3></div><strong>{money(product.price)}</strong></div>
    <button className="add-button" onClick={()=>onProduct(product)}>Select size <Plus size={15}/></button>
  </article>)}</div>
}
function ProductModal({ product, onClose, onAdd }) {
  const [size, setSize] = useState('M')
  return <div className="overlay modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="product-modal"><button className="modal-close icon-button" onClick={onClose}><X/></button><ProductVisual product={product} className="modal-product-visual"/><div className="modal-details"><span className="eyebrow">{product.drop} / {product.category}</span><h2>{product.name}</h2><strong className="modal-price">{money(product.price)}</strong><p>{product.description}</p><span className="detail-label">COLOR — {product.color.toUpperCase()}</span><span className="detail-label">SELECT SIZE</span><div className="size-picker">{['S','M','L','XL','XXL'].map(s=><button key={s} className={size===s?'size active':'size'} onClick={()=>setSize(s)}>{s}</button>)}</div><button className="button button-dark full" onClick={()=>onAdd(product,size)}>Add to bag <ShoppingBag size={17}/></button><p className="small-note">Product availability and final pricing must be confirmed with the brand.</p></div></section></div>
}
function AuthPage({onOpen}) { return <main className="auth-page"><span className="eyebrow">YOUR F&gt;F ACCOUNT</span><h1>Welcome <em>back.</em></h1><p>Sign in to explore your saved pieces and orders.</p><button className="button button-dark" onClick={onOpen}>Sign in / Create account <ArrowRight size={16}/></button><p className="small-note">Account features are a visual prototype and are not connected to authentication yet.</p></main> }
function AuthModal({onClose,onLogin}) {
  const [mode,setMode]=useState('login')
  return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="auth-modal"><button className="modal-close icon-button" onClick={onClose}><X/></button><div className="auth-logo">F&gt;F</div><span className="eyebrow">FAITH OVER FEAR RW</span><h2>{mode==='login'?'Good to have you back.':'Join the movement.'}</h2><p>{mode==='login'?'Sign in to your account.':'Create an account to stay close to every drop.'}</p><form onSubmit={e=>{e.preventDefault();alert('Demo only. Authentication has not been connected. No details were saved.')}}><label>Email address<input type="email" placeholder="you@example.com" required/></label><label>Password<input type="password" placeholder="At least 8 characters" minLength="8" required/></label>{mode==='signup'&&<label>Display name<input placeholder="Your name" required/></label>}<button className="button button-dark full" type="submit">{mode==='login'?'Sign in':'Create account'} <ArrowRight size={16}/></button></form><div className="auth-switch">{mode==='login'?"New to F>F?":"Already have an account?"} <button onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Create account':'Sign in'}</button></div><p className="small-note">Preview only — no account is created and form details are not stored.</p></section></div>
}
function Newsletter() {
  const [email,setEmail]=useState('')
  const [done,setDone]=useState(false)
  return <form className="newsletter-form" onSubmit={e=>{e.preventDefault();setDone(true)}}><label htmlFor="newsletter-email">EMAIL ADDRESS</label><div className="newsletter-input"><input id="newsletter-email" type="email" placeholder="Your email goes here" value={email} onChange={e=>setEmail(e.target.value)} required/><button aria-label="Subscribe"><ArrowRight/></button></div><p>{done?'Thanks — newsletter integration will be connected in the production version.':'New drops, special releases, and things worth believing in.'}</p></form>
}
function Footer({onLogin}) {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand"><Link to="/" className="footer-logo">F&gt;F</Link><p>Faith over fear.<br/>Wear what you believe.</p><span className="footer-location">KIGALI, RWANDA</span></div><div className="footer-col"><span className="eyebrow">EXPLORE</span><Link to="/shop">Shop all</Link><Link to="/drops">Latest drop</Link><a href="/#story">Our story</a><a href="/#custom">Custom printing</a></div><div className="footer-col"><span className="eyebrow">HELP & INFO</span><button onClick={onLogin}>Your account</button><a href="https://www.instagram.com/faithoverfear.rw__/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13}/></a><a href="mailto:hello@faithoverfearrw.netlify.app">Contact</a></div><div className="footer-statement"><span className="eyebrow">THE MESSAGE</span><p>Walk by faith.<br/><em>Never by fear.</em></p><Cross size={22}/></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} FAITH OVER FEAR RW</span><span>FAITH / STYLE / COMMUNITY</span><a href="#top" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}>BACK TO TOP ↑</a></div></footer>
}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>)
