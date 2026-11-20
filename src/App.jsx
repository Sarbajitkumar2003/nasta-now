
import { useState } from "react";
import {
  Search, MapPin, ShoppingBag, Clock, Star, Menu, X,
  Plus, Minus, Utensils, Bike, Store, Navigation,
  Coffee, Heart, ChevronRight, ShoppingCart
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const vendors = [
  {
    id: 1, name: "Babu Bhai Breakfast", type: "South Indian",
    rating: 4.8, time: "10-15 min", distance: "0.8 km",
    location: "Saheed Nagar, Bhubaneswar", price: 35,
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=700",
    lat: 20.2961, lng: 85.8245, tag: "Popular",
    items: [
      { id: 101, name: "Masala Dosa", price: 60, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400" },
      { id: 102, name: "Idli Sambar", price: 35, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400" },
      { id: 103, name: "Vada Sambar", price: 40, image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400" }
    ]
  },
  {
    id: 2, name: "Morning Chai Point", type: "Tea & Snacks",
    rating: 4.6, time: "5-10 min", distance: "1.2 km",
    location: "Vani Vihar, Bhubaneswar", price: 15,
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=700",
    lat: 20.3008, lng: 85.8415, tag: "Quick Bites",
    items: [
      { id: 201, name: "Masala Chai", price: 15, image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400" },
      { id: 202, name: "Samosa", price: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
      { id: 203, name: "Bread Pakoda", price: 25, image: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400" }
    ]
  },
  {
    id: 3, name: "Odia Tiffin House", type: "Odia Breakfast",
    rating: 4.9, time: "15-20 min", distance: "1.5 km",
    location: "Rasulgarh, Bhubaneswar", price: 30,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=700",
    lat: 20.3025, lng: 85.8622, tag: "Local Favourite",
    items: [
      { id: 301, name: "Dahibara Aloodum", price: 50, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400" },
      { id: 302, name: "Chakuli Pitha", price: 30, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
      { id: 303, name: "Ghuguni", price: 25, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400" }
    ]
  },
  {
    id: 4, name: "Healthy Morning Cafe", type: "Healthy Food",
    rating: 4.7, time: "15-20 min", distance: "2 km",
    location: "Patia, Bhubaneswar", price: 45,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700",
    lat: 20.3542, lng: 85.8194, tag: "Healthy",
    items: [
      { id: 401, name: "Fruit Bowl", price: 70, image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400" },
      { id: 402, name: "Poha", price: 45, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
      { id: 403, name: "Veg Sandwich", price: 55, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400" }
    ]
  }
];

const categories = [
  { name: "All", icon: "🍽️" },
  { name: "South Indian", icon: "🥞" },
  { name: "Odia Breakfast", icon: "🍛" },
  { name: "Tea & Snacks", icon: "☕" },
  { name: "Healthy Food", icon: "🥗" }
];

const markerIcon = new L.DivIcon({
  className: "vendor-marker",
  html: '<div class="marker-pin">🍳</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 38]
});

function MapFocus({ position }) {
  const map = useMap();
  if (position) map.flyTo(position, 14, { duration: 1 });
  return null;
}

export default function App() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [position, setPosition] = useState([20.2961, 85.8245]);
  const [locationText, setLocationText] = useState("Bhubaneswar, Odisha");
  const [customerName, setCustomerName] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  const filtered = vendors.filter(v =>
    (category === "All" || v.type === category) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) ||
     v.type.toLowerCase().includes(search.toLowerCase()) ||
     v.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())))
  );

  const addToCart = (item, vendor) => {
    setCart(old => {
      const found = old.find(x => x.id === item.id);
      if (found) return old.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...old, { ...item, qty: 1, vendorName: vendor.name }];
    });
  };

  const changeQty = (id, amount) => {
    setCart(old => old
      .map(item => item.id === id ? { ...item, qty: item.qty + amount } : item)
      .filter(item => item.qty > 0));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const locateMe = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition([coords.latitude, coords.longitude]);
        setLocationText("Your current location");
      },
      () => alert("Location permission nahi mili. Browser settings check karo.")
    );
  };

  const placeDemoOrder = () => {
    if (!customerName.trim()) {
      alert("Please enter your name first.");
      return;
    }
    setOrderMessage(`Thank you ${customerName}! Your demo order total is ₹${total}. Real ordering will be enabled after backend setup.`);
    setCart([]);
  };

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">🍳</span>
          <span>NASTA<span className="brand-green">NOW</span><small>GOOD FOOD. GOOD MORNING.</small></span>
        </a>
        <nav className="nav-links">
          <a href="#explore">Explore</a>
          <a href="#map">Nearby Vendors</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="header-actions">
          <button className="location-button" onClick={locateMe}>
            <MapPin size={17}/><span>{locationText}</span>
          </button>
          <button className="cart-button" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19}/> Cart
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          <button className="mobile-menu" onClick={() => setVendorOpen(true)}><Menu/></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow"><span className="live-dot"></span> YOUR MORNING, MADE DELICIOUS</span>
            <h1>Subah ki bhookh?<br/><span>NASTA NOW!</span></h1>
            <p>Discover your neighbourhood's best breakfast stalls. Fresh food, local vendors, and happy mornings.</p>
            <div className="hero-search">
              <Search size={21}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dosa, idli, chai, vendors..."/>
              <button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Search</button>
            </div>
            <div className="hero-points">
              <span><Clock size={16}/> Quick breakfast</span>
              <span><MapPin size={16}/> Nearby stalls</span>
              <span><Heart size={16}/> Support local</span>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1630383249896-424e482df921?w=1000" alt="Delicious breakfast dosa"/>
            <div className="floating-card">
              <span className="floating-emoji">🥞</span>
              <div><b>Fresh & tasty</b><small>Made by local vendors</small></div>
            </div>
            <div className="hero-sticker">GOOD<br/>MORNING!</div>
          </div>
        </section>

        <section className="stats-strip">
          <div><strong>Local</strong><span>Food vendors</span></div>
          <div><strong>Fresh</strong><span>Breakfast daily</span></div>
          <div><strong>Easy</strong><span>Pickup experience</span></div>
          <div><strong>Support</strong><span>Small businesses</span></div>
        </section>

        <section className="section" id="explore">
          <div className="section-heading">
            <div><span className="eyebrow">EXPLORE YOUR TASTE</span><h2>What's on your <span>plate?</span></h2><p>Find something delicious near you.</p></div>
            <button className="text-link" onClick={() => { setCategory("All"); setSearch(""); }}>View all <ChevronRight size={17}/></button>
          </div>

          <div className="categories">
            {categories.map(c => (
              <button key={c.name} className={`category-chip ${category === c.name ? "active" : ""}`} onClick={() => setCategory(c.name)}>
                <span>{c.icon}</span>{c.name}
              </button>
            ))}
          </div>

          <div className="vendor-grid">
            {filtered.map(v => (
              <article className="vendor-card" key={v.id}>
                <div className="vendor-image" onClick={() => setSelected(v)}>
                  <img src={v.image} alt={v.name}/>
                  <span className="vendor-tag">{v.tag}</span>
                  <button className="heart-button" aria-label="Favourite"><Heart size={17}/></button>
                </div>
                <div className="vendor-info">
                  <div className="vendor-title-row"><h3>{v.name}</h3><span className="rating"><Star size={14} fill="currentColor"/>{v.rating}</span></div>
                  <p className="vendor-type">{v.type}</p>
                  <p className="vendor-location"><MapPin size={14}/>{v.location}</p>
                  <div className="vendor-bottom">
                    <span><Clock size={14}/>{v.time}</span>
                    <span>{v.distance}</span>
                    <button onClick={() => setSelected(v)}>View menu <ChevronRight size={15}/></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <div className="empty-state">No vendors found. Try another search or category.</div>}
        </section>

        <section className="map-section" id="map">
          <div className="map-copy">
            <span className="eyebrow">FIND FOOD AROUND YOU</span>
            <h2>Your neighbourhood.<br/><span>Your breakfast.</span></h2>
            <p>Explore sample breakfast vendor locations on the map. Actual vendor locations will be added when seller registration and location services are connected.</p>
            <button className="primary-button" onClick={locateMe}><Navigation size={17}/> Use my location</button>
            <div className="map-legend"><span className="legend-dot"></span> Sample vendor locations</div>
          </div>
          <div className="map-frame">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
              <MapFocus position={position}/>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              {vendors.map(v => <Marker key={v.id} position={[v.lat, v.lng]} icon={markerIcon}>
                <Popup><b>{v.name}</b><br/>{v.type}<br/><button onClick={() => setSelected(v)}>View menu</button></Popup>
              </Marker>)}
            </MapContainer>
          </div>
        </section>

        <section className="how-section" id="how">
          <div className="section-heading centered"><div><span className="eyebrow">SIMPLE AS 1, 2, 3</span><h2>Breakfast made <span>easy.</span></h2><p>Your favourite local breakfast is just a few steps away.</p></div></div>
          <div className="steps-grid">
            <div className="step-card"><span>01</span><div className="step-icon">📍</div><h3>Find nearby</h3><p>Discover breakfast stalls around your neighbourhood.</p></div>
            <div className="step-card"><span>02</span><div className="step-icon">🥞</div><h3>Choose your food</h3><p>Explore menus, compare prices and add your favourites.</p></div>
            <div className="step-card"><span>03</span><div className="step-icon">🛍️</div><h3>Order & enjoy</h3><p>Place a demo order and plan your pickup.</p></div>
          </div>
        </section>

        <section className="seller-banner">
          <div><span className="eyebrow">ARE YOU A BREAKFAST VENDOR?</span><h2>Apna business <span>online lao!</span></h2><p>Join NASTA NOW and help more customers discover your food.</p></div>
          <button onClick={() => setVendorOpen(true)} className="seller-button"><Store size={18}/> Become a seller <ChevronRight size={17}/></button>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#"><span className="brand-icon">🍳</span><span>NASTA<span className="brand-green">NOW</span><small>GOOD FOOD. GOOD MORNING.</small></span></a>
        <p>Made for local food lovers and neighbourhood vendors.</p>
        <span>© 2026 NASTA NOW · Demo marketplace</span>
      </footer>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal menu-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelected(null)}><X/></button>
            <img className="modal-cover" src={selected.image} alt={selected.name}/>
            <div className="modal-content">
              <span className="eyebrow">{selected.type}</span>
              <h2>{selected.name}</h2>
              <p className="vendor-location"><MapPin size={15}/>{selected.location}</p>
              <div className="menu-list">
                {selected.items.map(item => (
                  <div className="menu-item" key={item.id}>
                    <img src={item.image} alt={item.name}/>
                    <div className="menu-item-info"><b>{item.name}</b><strong>₹{item.price}</strong></div>
                    <button className="add-button" onClick={() => addToCart(item, selected)}><Plus size={17}/> Add</button>
                  </div>
                ))}
              </div>
              <button className="primary-button full-button" onClick={() => { setSelected(null); setCartOpen(true); }}><ShoppingCart size={18}/> View cart ({cartCount})</button>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <div className="modal cart-modal" onClick={e => e.stopPropagation()}>
            <div className="cart-header"><h2><ShoppingBag/> Your cart</h2><button className="close-button" onClick={() => setCartOpen(false)}><X/></button></div>
            {cart.length === 0 ? <div className="empty-cart"><span>🛍️</span><h3>Your cart is empty</h3><p>Add something tasty from a vendor menu.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Explore food</button></div> :
              <>
                <div className="cart-items">{cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <div><b>{item.name}</b><small>{item.vendorName}</small><strong>₹{item.price * item.qty}</strong></div>
                    <div className="qty-control"><button onClick={() => changeQty(item.id, -1)}><Minus size={14}/></button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}><Plus size={14}/></button></div>
                  </div>
                ))}</div>
                <div className="cart-total"><span>Total</span><strong>₹{total}</strong></div>
                <input className="customer-input" placeholder="Enter your name" value={customerName} onChange={e => setCustomerName(e.target.value)}/>
                <button className="primary-button full-button" onClick={placeDemoOrder}>Place demo order · ₹{total}</button>
                <p className="demo-note">Demo only — no payment or real order is processed.</p>
              </>
            }
            {orderMessage && <p className="success-message">{orderMessage}</p>}
          </div>
        </div>
      )}

      {vendorOpen && (
        <div className="overlay" onClick={() => setVendorOpen(false)}>
          <div className="modal seller-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setVendorOpen(false)}><X/></button>
            <div className="step-icon">🏪</div>
            <span className="eyebrow">GROW WITH NASTA NOW</span>
            <h2>Become a local seller</h2>
            <p>Seller registration and dashboard will be connected in the next development stage.</p>
            <div className="seller-benefit"><Store/> Create your vendor profile</div>
            <div className="seller-benefit"><Utensils/> Add breakfast menu and prices</div>
            <div className="seller-benefit"><Bike/> Manage pickup and orders</div>
            <button className="primary-button full-button" onClick={() => setVendorOpen(false)}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
