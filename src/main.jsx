import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Cross, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react'
import './styles.css'

const fallbackProducts = [
  { id: 1, name: 'Psalm 23 Graphic Tee', category: 'T-Shirts', drop: 'DROP 002', price: 15000, color: 'White', image: '/images/pslams.jpeg', fallback: 'Psalm 23', description: 'A graphic tee inspired by Psalm 23. Designed to make your faith part of your everyday uniform.' },
  { id: 2, name: 'Faith Over Fear Tee', category: 'T-Shirts', drop: 'DROP 002', price: 15000, color: 'Black', image: '/images/faith-tee.jpg', fallback: 'F>F', description: 'The signature message, printed for everyday wear. Simple, bold, and built around belief.' },
  { id: 3, name: 'Jesus Walks Tee', category: 'T-Shirts', drop: 'DROP 002', price: 18000, color: 'Black', image: '/images/jesus-walks-tee.jpg', fallback: 'JESUS WALKS', description: 'A statement graphic from the Faith Over Fear collection.' },
  { id: 4, name: 'Scripture Backprint Tee', category: 'T-Shirts', drop: 'DROP 001', price: 18000, color: 'Black', image: '/images/scripture-tee.jpg', fallback: 'WALK BY FAITH', description: 'A bold back-print design inspired by scripture and street culture.' },
  { id: 5, name: 'Color of Grace Tee', category: 'T-Shirts', drop: 'DROP 002', price: 15000, color: 'White', image: '/images/color-grace-tee.jpg', fallback: 'GRACE', description: 'A colorful graphic print on a clean white tee.' },
  { id: 6, name: 'Faith Essentials Hoodie', category: 'Hoodies', drop: 'DROP 001', price: 28000, color: 'Black', image: '/images/faith-hoodie.jpg', fallback: 'F>F HOODIE', description: 'A relaxed everyday hoodie carrying the F>F identity.' },
]
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const getToken = () => { try { return localStorage.getItem('fof_token') } catch { return null } }
const setToken = token => { try { token ? localStorage.setItem('fof_token', token) : localStorage.removeItem('fof_token') } catch {} }
async function api(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData
  const headers = isForm ? {} : { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(API_URL + path, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = data?.detail
    throw new Error(typeof detail === 'string' ? detail : detail?.[0]?.msg?.replace(/^Value error, /, '') || 'Something went wrong. Please try again.')
  }
  return data
}
const assetUrl = path => path && path.startsWith('/uploads/') ? API_URL + path : path
const money = value => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(value).replace('RWF', 'FRW')

function App() {
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState(fallbackProducts)
  const [user, setUser] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const location = useLocation()
  const navigate = useNavigate()
  const reloadProducts = () => api('/api/products').then(list => Array.isArray(list) && setProducts(list)).catch(() => {})
  useEffect(() => { reloadProducts() }, [])
  useEffect(() => { if (getToken()) api('/api/auth/me').then(setUser).catch(() => setToken(null)) }, [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 5000); return () => clearTimeout(t) }, [toast])
  const logout = () => { setToken(null); setUser(null); navigate('/') }
  const openAccount = () => user ? navigate('/account') : setAuthOpen(true)
  const startCheckout = () => { setCartOpen(false); user ? setCheckoutOpen(true) : setAuthOpen(true) }
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
        <button className="icon-button account-trigger" aria-label="Account" onClick={openAccount}><span className="account-symbol">↗</span></button>
        <button className="icon-button bag-button" aria-label="Open shopping bag" onClick={() => setCartOpen(true)}><ShoppingBag size={20}/><span className="bag-count">{cartCount}</span></button>
      </div>
    </header>
    {searchOpen && <div className="search-bar"><Search size={18}/><input autoFocus placeholder="Search tees, hoodies, scripture..." value={query} onChange={e => setQuery(e.target.value)}/><button className="text-button" onClick={() => { setSearchOpen(false); navigate('/shop') }}>View results <ArrowRight size={15}/></button><button className="icon-button" onClick={() => {setSearchOpen(false);setQuery('')}}><X size={18}/></button></div>}
    <Routes>
      <Route path="/" element={<Home products={products} onShop={shop} onProduct={setActiveProduct} onAdd={addToCart} />} />
      <Route path="/shop" element={<Shop products={products} category={category} setCategory={setCategory} query={query} onProduct={setActiveProduct} onAdd={addToCart} />} />
      <Route path="/drops" element={<Shop products={products} category={category} setCategory={setCategory} query={query} onProduct={setActiveProduct} onAdd={addToCart} dropOnly />} />
      <Route path="/login" element={<AuthPage onOpen={() => setAuthOpen(true)} />} />
      <Route path="/account" element={<AccountPage user={user} onLogout={logout} onOpenAuth={() => setAuthOpen(true)} />} />
      <Route path="/admin" element={<AdminPage user={user} onProductsChanged={reloadProducts} />} />
      <Route path="*" element={<Home products={products} onShop={shop} onProduct={setActiveProduct} onAdd={addToCart} />} />
    </Routes>
    <Footer onLogin={openAccount}/>

    {cartOpen && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setCartOpen(false)}><aside className="drawer">
      <div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>Your bag <span className="muted">({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)}><X/></button></div>
      {cart.length === 0 ? <div className="empty-state"><ShoppingBag size={32}/><h3>Your bag is empty.</h3><p>Find a piece that speaks to you.</p><button className="button button-dark" onClick={() => {setCartOpen(false);shop()}}>Explore the collection <ArrowRight size={16}/></button></div> :
        <><div className="cart-items">{cart.map(item => <div className="cart-item" key={`${item.id}-${item.size}`}><ProductVisual product={item}/><div className="cart-info"><h3>{item.name}</h3><p>{item.color} · Size {item.size}</p><strong>{money(item.price)}</strong><div className="quantity"><button onClick={() => changeQuantity(item.id,item.size,-1)}><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id,item.size,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={() => changeQuantity(item.id,item.size,-item.quantity)}>Remove</button></div>)}</div>
        <div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><p>We confirm delivery and payment (MTN MoMo) with you after you place your order.</p><button className="button button-dark full" onClick={startCheckout}>Continue to checkout <ArrowRight size={16}/></button><button className="continue-link" onClick={() => setCartOpen(false)}>Continue shopping</button></div></>}
    </aside></div>}
    {activeProduct && <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} onAdd={addToCart}/>}
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={u => { setUser(u); setAuthOpen(false); if (cart.length) setCheckoutOpen(true) }}/>}
    {checkoutOpen && <CheckoutModal cart={cart} total={total} onClose={() => setCheckoutOpen(false)} onDone={order => { setCheckoutOpen(false); setCart([]); setToast(`Order #${order.id} received. We'll contact you to confirm delivery and payment.`); navigate('/account') }}/>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </>
}

function Home({ products, onShop, onProduct, onAdd }) {
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
      <ProductGrid products={(() => { const d = products.map(p => p.drop).sort().pop(); const latest = products.filter(p => p.drop === d); return (latest.length ? latest : products).slice(0, 4) })()} onProduct={onProduct} onAdd={onAdd}/>
    </section>
    <section className="manifesto" id="story">
      <div className="manifesto-image"><div className="image-caption">BUILT ON BELIEF — SINCE DAY ONE</div></div>
      <div className="manifesto-copy"><span className="eyebrow">MORE THAN WHAT YOU WEAR</span><h2>Belief is the<br/>real <em>statement.</em></h2><p>Faith Over Fear is for people who move with purpose. We bring faith, street culture, and personal expression together through graphic tees and wearable messages.</p><a className="underlined-link" href="#custom">Get to know us <ArrowUpRight size={17}/></a><div className="manifesto-number">F&gt;F <span>EST. RWANDA</span></div></div>
    </section>
    <section className="custom-section" id="custom"><div className="custom-content"><span className="eyebrow">YOUR IDEA. YOUR MESSAGE.</span><h2>Make it <em>personal.</em></h2><p>Need custom tees for your crew, event, or next big idea? Let's put your vision on fabric.</p><a className="button button-light" href="https://www.instagram.com/faithoverfear.rw__/" target="_blank" rel="noreferrer">Talk custom printing <ArrowUpRight size={16}/></a></div><div className="custom-stamp">PRINT<br/>YOUR<br/>PURPOSE<span>F&gt;F</span></div></section>
    <section className="newsletter"><div><span className="eyebrow">STAY IN THE LOOP</span><h2>First to know.<br/><em>First to wear.</em></h2></div><Newsletter/></section>
  </main>
}

function Shop({ products, category, setCategory, query, onProduct, onAdd, dropOnly=false }) {
  const [sort, setSort] = useState('Featured')
  const [localSearch, setLocalSearch] = useState(query || '')
  const [mobileFilter, setMobileFilter] = useState(false)
  const cats = ['All', ...new Set(products.map(p => p.category))]
  const latestDrop = products.map(p => p.drop).sort().pop()
  const visible = useMemo(() => {
    let list = products.filter(p => (category === 'All' || p.category === category) && (!dropOnly || p.drop === latestDrop) && `${p.name} ${p.category} ${p.drop} ${p.description}`.toLowerCase().includes(localSearch.toLowerCase()))
    if (sort === 'Price: low to high') list = [...list].sort((a,b) => a.price-b.price)
    if (sort === 'Price: high to low') list = [...list].sort((a,b) => b.price-a.price)
    return list
  }, [products, category, dropOnly, localSearch, sort, latestDrop])
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
    {product.image && <img src={assetUrl(product.image)} alt={product.name} onError={e=>{e.currentTarget.style.display='none';e.currentTarget.nextSibling.style.display='flex'}}/>}
    <div className="product-placeholder" style={product.image ? undefined : { display: 'flex' }}><span className="placeholder-logo">F&gt;F</span><span className="placeholder-art">{product.fallback}</span><small>FAITH OVER FEAR RW</small></div>
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
function AuthPage({onOpen}) { return <main className="auth-page"><span className="eyebrow">YOUR F&gt;F ACCOUNT</span><h1>Welcome <em>back.</em></h1><p>Sign in to explore your saved pieces and orders.</p><button className="button button-dark" onClick={onOpen}>Sign in / Create account <ArrowRight size={16}/></button></main> }
function AuthModal({onClose,onLogin}) {
  const [mode,setMode]=useState('login')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const submit = async e => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setError('')
    try {
      const body = mode === 'login' ? { email: f.get('email'), password: f.get('password') } : { email: f.get('email'), password: f.get('password'), name: f.get('name') }
      const data = await api(mode === 'login' ? '/api/auth/login' : '/api/auth/register', { method: 'POST', body })
      setToken(data.access_token)
      onLogin(data.user)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="overlay modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="auth-modal"><button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X/></button><div className="auth-logo">F&gt;F</div><span className="eyebrow">FAITH OVER FEAR RW</span><h2>{mode==='login'?'Good to have you back.':'Join the movement.'}</h2><p>{mode==='login'?'Sign in to your account.':'Create an account to order and stay close to every drop.'}</p><form onSubmit={submit}><label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required/></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength="8" maxLength="72" autoComplete={mode==='login'?'current-password':'new-password'} required/></label>{mode==='signup'&&<label>Display name<input name="name" placeholder="Your name" maxLength="80" autoComplete="name" required/></label>}{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-dark full" type="submit" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'} <ArrowRight size={16}/></button></form><div className="auth-switch">{mode==='login'?"New to F>F?":"Already have an account?"} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('')}}>{mode==='login'?'Create account':'Sign in'}</button></div></section></div>
}
function CheckoutModal({cart,total,onClose,onDone}) {
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const submit = async e => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setError('')
    try {
      const order = await api('/api/orders', { method: 'POST', body: { phone: f.get('phone'), address: f.get('address'), notes: f.get('notes') || '', items: cart.map(i => ({ product_id: i.id, size: i.size, quantity: i.quantity })) } })
      onDone(order)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="overlay modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="auth-modal"><button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X/></button><span className="eyebrow">CHECKOUT</span><h2>Where should we deliver?</h2><p>{cart.reduce((n,i)=>n+i.quantity,0)} item(s) · {money(total)}. Payment (MTN MoMo) is arranged with you after we receive your order.</p><form onSubmit={submit}><label>Phone number<input name="phone" type="tel" placeholder="0788 123 456" autoComplete="tel" required/></label><label>Delivery address<textarea name="address" rows="3" minLength="5" maxLength="300" placeholder="Neighborhood, street, landmark" autoComplete="street-address" required/></label><label>Notes (optional)<input name="notes" maxLength="500" placeholder="Anything we should know?"/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-dark full" type="submit" disabled={busy}>{busy?'Placing order…':'Place order'} <ArrowRight size={16}/></button></form><p className="small-note">The final total is recalculated by our server from current prices.</p></section></div>
}
function AccountPage({user,onLogout,onOpenAuth}) {
  const [orders,setOrders]=useState(null)
  useEffect(()=>{ if(user) api('/api/orders').then(setOrders).catch(()=>setOrders([])) },[user])
  if(!user) return <main className="auth-page"><span className="eyebrow">YOUR F&gt;F ACCOUNT</span><h1>Welcome <em>back.</em></h1><p>Sign in to see your orders.</p><button className="button button-dark" onClick={onOpenAuth}>Sign in / Create account <ArrowRight size={16}/></button></main>
  return <main className="auth-page"><span className="eyebrow">YOUR F&gt;F ACCOUNT</span><h1>Hello, <em>{user.name.split(' ')[0]}.</em></h1><p>{user.email}</p>
    <div className="order-list">{orders===null?<p className="small-note">Loading orders…</p>:orders.length===0?<p className="small-note">No orders yet.</p>:orders.map(o=><div className="order-row" key={o.id}><div className="order-row-top"><span>Order #{o.id}</span><span className="order-status">{o.status}</span></div><span>{o.items.map(i=>`${i.quantity}× ${i.name} (${i.size})`).join(', ')}</span><span>{money(o.total)} · {new Date(o.created_at).toLocaleDateString()}</span></div>)}</div>
    {user.is_admin&&<Link className="button button-light admin-link" to="/admin">Admin dashboard <ArrowUpRight size={15}/></Link>} <button className="button button-dark" onClick={onLogout}>Sign out</button></main>
}
function AdminPage({user,onProductsChanged}) {
  const [tab,setTab]=useState('products')
  if(!user?.is_admin) return <main className="auth-page"><span className="eyebrow">ADMIN</span><h1>Restricted <em>area.</em></h1><p>Sign in with an admin account to continue.</p></main>
  return <main className="admin-page"><span className="eyebrow">FAITH OVER FEAR RW / ADMIN</span><h1>Dashboard</h1>
    <div className="admin-tabs"><button className={tab==='products'?'category-tab active':'category-tab'} onClick={()=>setTab('products')}>Products</button><button className={tab==='orders'?'category-tab active':'category-tab'} onClick={()=>setTab('orders')}>Orders</button></div>
    {tab==='products'?<AdminProducts onChanged={onProductsChanged}/>:<AdminOrders/>}</main>
}
function AdminProducts({onChanged}) {
  const [list,setList]=useState(null)
  const [editing,setEditing]=useState(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [preview,setPreview]=useState('')
  const load = () => api('/api/admin/products').then(setList).catch(e=>setError(e.message))
  useEffect(()=>{ load() },[])
  const open = p => { setEditing(p); setPreview(p && p !== 'new' ? assetUrl(p.image) : ''); setError('') }
  const submit = async e => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = form.elements.image.files[0]
    if (!file) fd.delete('image')
    if (editing !== 'new') fd.set('active', form.elements.active.checked ? 'true' : 'false')
    setBusy(true); setError('')
    try {
      await api(editing === 'new' ? '/api/admin/products' : `/api/admin/products/${editing.id}`, { method: editing === 'new' ? 'POST' : 'PUT', body: fd })
      setEditing(null); await load(); onChanged()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const remove = async p => {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return
    try { await api(`/api/admin/products/${p.id}`, { method: 'DELETE' }); await load(); onChanged() } catch (err) { alert(err.message) }
  }
  const p = editing && editing !== 'new' ? editing : {}
  return <section className="admin-section">
    <div className="admin-bar"><span>{list ? `${list.length} products` : 'Loading…'}</span><button className="button button-light" onClick={()=>open('new')}>Add product <Plus size={15}/></button></div>
    {error && !editing && <p className="form-error">{error}</p>}
    <div className="admin-table">{list?.map(x=><div className="admin-row" key={x.id}>
      <div className="admin-thumb">{x.image ? <img src={assetUrl(x.image)} alt=""/> : <span>F&gt;F</span>}</div>
      <div className="admin-info"><strong>{x.name}</strong><span>{x.category} · {x.drop} · {x.color} · {money(x.price)}</span></div>
      <span className={x.active ? 'order-status' : 'order-status status-off'}>{x.active ? 'Live' : 'Hidden'}</span>
      <button className="text-button" onClick={()=>open(x)}>Edit</button><button className="text-button danger" onClick={()=>remove(x)}>Delete</button></div>)}</div>
    {editing && <div className="overlay modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><section className="auth-modal admin-modal"><button className="modal-close icon-button" onClick={()=>setEditing(null)} aria-label="Close"><X/></button>
      <span className="eyebrow">{editing==='new'?'NEW PRODUCT':'EDIT PRODUCT'}</span><h2>{editing==='new'?'Add a product':p.name}</h2>
      <form onSubmit={submit}>
        <label>Name<input name="name" defaultValue={p.name} maxLength="120" required/></label>
        <div className="admin-grid"><label>Category<input name="category" list="cats" defaultValue={p.category||'T-Shirts'} maxLength="40" required/><datalist id="cats"><option>T-Shirts</option><option>Hoodies</option></datalist></label>
        <label>Drop<input name="drop" defaultValue={p.drop||'DROP 003'} maxLength="20" required/></label>
        <label>Price (FRW)<input name="price" type="number" min="100" max="10000000" step="100" defaultValue={p.price} required/></label>
        <label>Color<input name="color" defaultValue={p.color||'Black'} maxLength="40" required/></label></div>
        <label>Description<textarea name="description" rows="3" maxLength="1000" defaultValue={p.description}/></label>
        <label>Placeholder text (shown if no image)<input name="fallback" defaultValue={p.fallback} maxLength="60" placeholder="Defaults to the name"/></label>
        <label>Photo (JPG, PNG or WebP, max 5 MB)<input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{ const f=e.target.files[0]; setPreview(f ? URL.createObjectURL(f) : (editing!=='new'?assetUrl(p.image):'')) }}/></label>
        {preview && <img className="admin-preview" src={preview} alt="Preview"/>}
        {editing!=='new' && <label className="admin-check"><input name="active" type="checkbox" defaultChecked={p.active}/> Visible in the shop</label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-dark full" type="submit" disabled={busy}>{busy?'Saving…':'Save product'} <ArrowRight size={16}/></button>
      </form></section></div>}
  </section>
}
const STATUSES = ['pending','confirmed','paid','shipped','delivered','cancelled']
function AdminOrders() {
  const [orders,setOrders]=useState(null)
  const [error,setError]=useState('')
  useEffect(()=>{ api('/api/admin/orders').then(setOrders).catch(e=>setError(e.message)) },[])
  const setStatus = async (id,status) => {
    try { const o = await api(`/api/admin/orders/${id}`, { method: 'PATCH', body: { status } }); setOrders(list=>list.map(x=>x.id===id?o:x)) } catch (err) { setError(err.message) }
  }
  return <section className="admin-section">{error&&<p className="form-error">{error}</p>}{orders===null?<p className="small-note">Loading orders…</p>:orders.length===0?<p className="small-note">No orders yet.</p>:
    <div className="admin-table">{orders.map(o=><div className="admin-order" key={o.id}>
      <div className="order-row-top"><span>Order #{o.id} · {money(o.total)}</span><select value={o.status} onChange={e=>setStatus(o.id,e.target.value)} aria-label={`Status of order ${o.id}`}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
      <span>{o.customer_name} · {o.customer_email} · <a href={`tel:${o.phone}`}>{o.phone}</a></span>
      <span>{o.address}{o.notes?` — ${o.notes}`:''}</span>
      <span>{o.items.map(i=>`${i.quantity}× ${i.name} (${i.size})`).join(', ')}</span>
      <span className="muted">{new Date(o.created_at).toLocaleString()}</span></div>)}</div>}</section>
}
function Newsletter() {
  const [email,setEmail]=useState('')
  const [state,setState]=useState('idle')
  const submit = async e => {
    e.preventDefault(); setState('busy')
    try { await api('/api/newsletter', { method: 'POST', body: { email } }); setState('done'); setEmail('') } catch { setState('error') }
  }
  return <form className="newsletter-form" onSubmit={submit}><label htmlFor="newsletter-email">EMAIL ADDRESS</label><div className="newsletter-input"><input id="newsletter-email" type="email" placeholder="Your email goes here" value={email} onChange={e=>setEmail(e.target.value)} required/><button aria-label="Subscribe" disabled={state==='busy'}><ArrowRight/></button></div><p>{state==='done'?"You're in. Watch your inbox for the next drop.":state==='error'?'Something went wrong. Please try again.':'New drops, special releases, and things worth believing in.'}</p></form>
}
function Footer({onLogin}) {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand"><Link to="/" className="footer-logo">F&gt;F</Link><p>Faith over fear.<br/>Wear what you believe.</p><span className="footer-location">KIGALI, RWANDA</span></div><div className="footer-col"><span className="eyebrow">EXPLORE</span><Link to="/shop">Shop all</Link><Link to="/drops">Latest drop</Link><a href="/#story">Our story</a><a href="/#custom">Custom printing</a></div><div className="footer-col"><span className="eyebrow">HELP & INFO</span><button onClick={onLogin}>Your account</button><a href="https://www.instagram.com/faithoverfear.rw__/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13}/></a><a href="mailto:hello@faithoverfearrw.netlify.app">Contact</a></div><div className="footer-statement"><span className="eyebrow">THE MESSAGE</span><p>Walk by faith.<br/><em>Never by fear.</em></p><Cross size={22}/></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} FAITH OVER FEAR RW</span><span>FAITH / STYLE / COMMUNITY</span><a href="#top" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}>BACK TO TOP ↑</a></div></footer>
}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>)
