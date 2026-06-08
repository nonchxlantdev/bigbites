import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ClipboardList,
  Clock,
  Edit3,
  LogOut,
  Menu as MenuIcon,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  X
} from 'lucide-react';
import './styles.css';
import logoUrl from '../images/logo.jpg';
import sampleMenu from '../server/data/menu.json';

const categories = ['Patties', 'Chicken Meals', 'Shawarma', 'Burgers', 'Quesadillas', 'Salads', 'Wraps'];
const statuses = ['New Order', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const demoMenuKey = 'bigbite-demo-menu';
const demoOrdersKey = 'bigbite-demo-orders';

async function apiJson(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`API unavailable: ${path}`);
  return res.json();
}

function loadDemoMenu() {
  const saved = localStorage.getItem(demoMenuKey);
  return saved ? JSON.parse(saved) : sampleMenu;
}

function saveDemoMenu(menu) {
  localStorage.setItem(demoMenuKey, JSON.stringify(menu));
}

function loadDemoOrders() {
  const saved = localStorage.getItem(demoOrdersKey);
  return saved ? JSON.parse(saved) : [];
}

function saveDemoOrders(orders) {
  localStorage.setItem(demoOrdersKey, JSON.stringify(orders));
}

function demoOrderNumber() {
  const stamp = new Date().toISOString().slice(2, 10).replaceAll('-', '');
  return `BB-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function Header({ page, setPage, cartCount, openCart, isAdmin, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (nextPage) => {
    setPage(nextPage);
    setMenuOpen(false);
  };
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button onClick={() => go('home')} className="flex items-center gap-3">
          <img src={logoUrl} alt="Big Bite logo" className="h-12 w-12 rounded-full object-cover ring-2 ring-bite-red/10" />
          <div className="text-left">
            <p className="text-xl font-black uppercase leading-none text-bite-red">Big Bite</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order ahead</p>
          </div>
        </button>
        <nav className="hidden items-center gap-2 sm:flex">
          <button onClick={() => go('menu')} className={`nav-link ${page === 'menu' ? 'nav-active' : ''}`}>Menu</button>
          <button onClick={() => go('admin-login')} className="nav-link">Owner</button>
          {isAdmin && <button onClick={() => go('admin-dashboard')} className="nav-link">Dashboard</button>}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="icon-btn sm:hidden" aria-label="Open menu">
            <MenuIcon size={20} />
          </button>
          {isAdmin && (
            <button onClick={logout} className="icon-btn" aria-label="Log out">
              <LogOut size={18} />
            </button>
          )}
          <button onClick={openCart} className="relative rounded-full bg-bite-red p-3 text-white shadow-bite" aria-label="Open cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 shadow-sm sm:hidden">
          <div className="mx-auto grid max-w-6xl gap-2">
            <button onClick={() => go('menu')} className="mobile-nav-link">Menu</button>
            <button onClick={() => go('admin-login')} className="mobile-nav-link">Owner Login</button>
            {isAdmin && <button onClick={() => go('admin-dashboard')} className="mobile-nav-link">Dashboard</button>}
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage({ setPage }) {
  return (
    <main className="bg-white">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl content-center gap-8 px-4 py-10 sm:grid-cols-[1.05fr_0.95fr] sm:items-center">
        <div className="space-y-6">
          <img src={logoUrl} alt="Big Bite" className="h-24 w-24 rounded-full object-cover shadow-bite" />
          <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-bite-red">Fresh pickup orders</p>
            <h1 className="max-w-xl text-5xl font-black leading-[0.98] text-bite-dark sm:text-6xl">Hot meals, bold bites, ready when you arrive.</h1>
            <p className="max-w-lg text-lg leading-8 text-gray-600">Order patties, chicken meals, shawarma, burgers, wraps, salads, and quesadillas from Big Bite with a quick pickup checkout.</p>
          </div>
          <button onClick={() => setPage('menu')} className="primary-btn text-lg">
            <ShoppingBag size={21} />
            Start Order
          </button>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] bg-bite-red p-5 text-white shadow-bite">
          <div className="absolute right-4 top-4 rounded-full bg-white/20 px-4 py-2 text-sm font-black">Pickup Fast</div>
          <div className="grid aspect-[4/5] place-items-center rounded-[1.5rem] bg-white/10">
            <div className="text-center">
              <p className="text-8xl font-black">BB</p>
              <p className="mt-2 text-xl font-black uppercase">Big Bite Favorites</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MenuPage({ menu, addToCart }) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-bite-red">Menu</p>
          <h1 className="text-3xl font-black text-bite-dark">Choose your Big Bite</h1>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {categories.map((category) => (
          <a key={category} href={`#${category}`} className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm">
            {category}
          </a>
        ))}
      </div>
      <div className="space-y-8 pt-4">
        {categories.map((category) => (
          <MenuCategory key={category} category={category} items={menu.filter((item) => item.category === category)} addToCart={addToCart} />
        ))}
      </div>
    </main>
  );
}

function MenuCategory({ category, items, addToCart }) {
  return (
    <section id={category} className="scroll-mt-24">
      <h2 className="mb-3 text-2xl font-black text-bite-dark">{category}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} addToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}

function MenuItemCard({ item, addToCart }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <article className="food-card">
      <div className="food-image">
        <span>{item.name.split(' ').map((word) => word[0]).join('').slice(0, 3)}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-black text-bite-dark">{item.name}</h3>
          <p className="shrink-0 text-lg font-black text-bite-red">{money(item.price)}</p>
        </div>
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">{item.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <QuantityControl quantity={quantity} setQuantity={setQuantity} />
          <button onClick={() => addToCart(item, quantity)} className="secondary-btn">
            <Plus size={17} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

function QuantityControl({ quantity, setQuantity }) {
  return (
    <div className="flex h-11 items-center rounded-full border border-gray-200 bg-gray-50">
      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-11 w-10 place-items-center text-gray-700" aria-label="Decrease quantity">
        <Minus size={16} />
      </button>
      <span className="w-8 text-center font-black">{quantity}</span>
      <button onClick={() => setQuantity(quantity + 1)} className="grid h-11 w-10 place-items-center text-gray-700" aria-label="Increase quantity">
        <Plus size={16} />
      </button>
    </div>
  );
}

function Cart({ isOpen, closeCart, cart, updateQuantity, removeItem, subtotal, setPage }) {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      <div onClick={closeCart} className={`absolute inset-0 bg-black/35 transition ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-bite transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div>
            <p className="text-sm font-bold uppercase text-bite-red">Your order</p>
            <h2 className="text-2xl font-black">Cart</h2>
          </div>
          <button onClick={closeCart} className="icon-btn" aria-label="Close cart"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center rounded-2xl bg-gray-50 p-8 text-center text-gray-500">Your cart is waiting for something delicious.</div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="text-sm text-gray-500">{money(item.price)} each</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-bite-red" aria-label="Remove item"><Trash2 size={18} /></button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityControl quantity={item.quantity} setQuantity={(quantity) => updateQuantity(item.id, quantity)} />
                    <p className="font-black">{money(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="flex justify-between text-lg"><span>Total</span><strong>{money(subtotal)}</strong></div>
          </div>
          <button disabled={!cart.length} onClick={() => { closeCart(); setPage('checkout'); }} className="primary-btn w-full justify-center disabled:cursor-not-allowed disabled:bg-gray-300">
            Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

function CheckoutForm({ cart, subtotal, createOrder, setPage }) {
  const [form, setForm] = useState({ customerName: '', phone: '', pickupTime: '', notes: '' });
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    await createOrder({ ...form, items: cart });
    setLoading(false);
  }
  if (!cart.length) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <button onClick={() => setPage('menu')} className="primary-btn mx-auto mt-5">Back to Menu</button>
      </main>
    );
  }
  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="rounded-3xl bg-white p-5 shadow-bite">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-bite-red">Checkout</p>
        <h1 className="mb-5 text-3xl font-black text-bite-dark">Pickup details</h1>
        <div className="grid gap-4">
          <label className="field-label">Customer name<input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="field" /></label>
          <label className="field-label">Phone number<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" /></label>
          <label className="field-label">Pickup time<input required type="time" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} className="field" /></label>
          <label className="field-label">Special instructions<textarea rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="field resize-none" /></label>
        </div>
        <button disabled={loading} className="primary-btn mt-5 w-full justify-center">{loading ? 'Submitting...' : 'Submit Order'}</button>
      </form>
      <aside className="rounded-3xl bg-gray-50 p-5">
        <h2 className="mb-3 text-xl font-black">Order summary</h2>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span>{item.quantity} x {item.name}</span>
              <strong>{money(item.price * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-gray-200 pt-4 text-lg font-black">
          <span>Total</span>
          <span>{money(subtotal)}</span>
        </div>
      </aside>
    </main>
  );
}

function SuccessPage({ order, setPage }) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-xl place-items-center px-4 py-10 text-center">
      <div className="rounded-3xl bg-white p-8 shadow-bite">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-bite-soft text-bite-red"><ClipboardList size={30} /></div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-bite-red">Order received</p>
        <h1 className="mt-2 text-3xl font-black">Order {order?.orderNumber}</h1>
        <p className="mt-3 leading-7 text-gray-600">Thanks for ordering from Big Bite. Your pickup order is in the kitchen queue and will be confirmed soon.</p>
        <button onClick={() => setPage('menu')} className="primary-btn mx-auto mt-6">Order More</button>
      </div>
    </main>
  );
}

function AdminLayout({ page, setPage, children }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-bite-red">Owner</p>
          <h1 className="text-3xl font-black text-bite-dark">Big Bite Admin</h1>
        </div>
        <div className="flex rounded-full bg-gray-100 p-1">
          <button onClick={() => setPage('admin-dashboard')} className={`admin-tab ${page === 'admin-dashboard' ? 'admin-tab-active' : ''}`}>Orders</button>
          <button onClick={() => setPage('admin-menu')} className={`admin-tab ${page === 'admin-menu' ? 'admin-tab-active' : ''}`}>Menu</button>
        </div>
      </div>
      {children}
    </main>
  );
}

function LoginPage({ login }) {
  const [form, setForm] = useState({ username: 'owner', password: 'bigbite123' });
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const ok = await login(form);
    if (!ok) setError('Invalid login. Try owner / bigbite123.');
  }
  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-md place-items-center px-4">
      <form onSubmit={submit} className="w-full rounded-3xl bg-white p-6 shadow-bite">
        <img src={logoUrl} alt="Big Bite" className="mx-auto mb-4 h-20 w-20 rounded-full object-cover" />
        <h1 className="text-center text-3xl font-black">Owner Login</h1>
        <div className="mt-5 grid gap-4">
          <label className="field-label">Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="field" /></label>
          <label className="field-label">Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="field" /></label>
        </div>
        {error && <p className="mt-3 text-sm font-bold text-bite-red">{error}</p>}
        <button className="primary-btn mt-5 w-full justify-center">Login</button>
      </form>
    </main>
  );
}

function Dashboard({ orders, filter, setFilter, changeStatus }) {
  const filtered = filter === 'All' ? orders : orders.filter((order) => order.status === filter);
  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {['All', ...statuses].map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`status-filter ${filter === status ? 'status-filter-active' : ''}`}>{status}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((order) => <OrderCard key={order.id} order={order} changeStatus={changeStatus} />)}
      </div>
    </div>
  );
}

function OrderCard({ order, changeStatus }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-bite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-bite-dark">{order.customerName}</p>
          <a href={`tel:${order.phone}`} className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-bite-red"><Phone size={15} />{order.phone}</a>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-gray-600">
        <p className="flex items-center gap-2 font-bold text-bite-dark"><Clock size={16} />Pickup: {order.pickupTime}</p>
        {order.items.map((item) => <p key={item.id}>{item.quantity} x {item.name} - {money(item.price * item.quantity)}</p>)}
        {order.notes && <p className="rounded-2xl bg-gray-50 p-3">Notes: {order.notes}</p>}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <strong className="text-lg">{money(order.total)}</strong>
        <select value={order.status} onChange={(e) => changeStatus(order.id, e.target.value)} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-bold">
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const tone = {
    'New Order': 'bg-red-100 text-bite-red',
    Confirmed: 'bg-blue-100 text-blue-700',
    Preparing: 'bg-yellow-100 text-yellow-800',
    'Ready for Pickup': 'bg-green-100 text-green-700',
    Completed: 'bg-gray-100 text-gray-700',
    Cancelled: 'bg-zinc-200 text-zinc-700'
  }[status];
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{status}</span>;
}

function MenuManagement({ menu, saveMenuItem, removeMenuItem }) {
  const empty = { category: 'Patties', name: '', price: '', description: '', enabled: true };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  async function save(event) {
    event.preventDefault();
    await saveMenuItem(editingId, form);
    setForm(empty);
    setEditingId(null);
  }
  async function remove(id) {
    await removeMenuItem(id);
  }
  function edit(item) {
    setEditingId(item.id);
    setForm({ category: item.category, name: item.name, price: item.price, description: item.description, enabled: item.enabled !== false });
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <form onSubmit={save} className="rounded-3xl bg-white p-5 shadow-bite">
        <h2 className="mb-4 text-xl font-black">{editingId ? 'Edit item' : 'Add item'}</h2>
        <div className="grid gap-3">
          <label className="field-label">Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="field-label">Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" /></label>
          <label className="field-label">Price<input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field" /></label>
          <label className="field-label">Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field resize-none" /></label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />Enabled</label>
        </div>
        <button className="primary-btn mt-4 w-full justify-center">{editingId ? 'Save Item' : 'Add Item'}</button>
      </form>
      <div className="grid gap-3">
        {menu.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black">{item.name} <span className="text-bite-red">{money(item.price)}</span></p>
              <p className="text-sm text-gray-500">{item.category} - {item.enabled === false ? 'Disabled' : 'Enabled'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(item)} className="icon-btn" aria-label="Edit item"><Edit3 size={18} /></button>
              <button onClick={() => remove(item.id)} className="icon-btn text-bite-red" aria-label="Delete item"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('home');
  const [menu, setMenu] = useState([]);
  const [adminMenu, setAdminMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [token, setToken] = useState(localStorage.getItem('bigbite-token'));

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  async function refreshMenu() {
    try {
      const [publicMenu, allMenu] = await Promise.all([apiJson('/api/menu'), apiJson('/api/admin/menu')]);
      setMenu(publicMenu);
      setAdminMenu(allMenu);
    } catch {
      const allMenu = loadDemoMenu();
      setMenu(allMenu.filter((item) => item.enabled !== false));
      setAdminMenu(allMenu);
    }
  }

  async function refreshOrders() {
    try {
      setOrders(await apiJson('/api/admin/orders'));
    } catch {
      setOrders(loadDemoOrders());
    }
  }

  useEffect(() => { refreshMenu(); }, []);
  useEffect(() => { if (token) refreshOrders(); }, [token]);

  function addToCart(item, quantity) {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) return current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem);
      return [...current, { ...item, quantity }];
    });
    setCartOpen(true);
  }

  function updateQuantity(id, quantity) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity } : item));
  }

  async function createOrder(payload) {
    let order;
    try {
      order = await apiJson('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch {
      const menuItems = loadDemoMenu();
      const items = payload.items.map((cartItem) => {
        const menuItem = menuItems.find((item) => item.id === cartItem.id);
        return {
          id: cartItem.id,
          name: menuItem?.name || cartItem.name,
          price: Number(menuItem?.price || cartItem.price || 0),
          quantity: Number(cartItem.quantity || 1)
        };
      });
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      order = {
        id: `order-${Date.now()}`,
        orderNumber: demoOrderNumber(),
        customerName: payload.customerName,
        phone: payload.phone,
        pickupTime: payload.pickupTime,
        notes: payload.notes || '',
        items,
        subtotal: total,
        total,
        status: 'New Order',
        createdAt: new Date().toISOString()
      };
      const nextOrders = [order, ...loadDemoOrders()];
      saveDemoOrders(nextOrders);
      setOrders(nextOrders);
    }
    setCart([]);
    setSuccessOrder(order);
    setPage('success');
    refreshOrders();
  }

  async function login(form) {
    try {
      const data = await apiJson('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      localStorage.setItem('bigbite-token', data.token);
      setToken(data.token);
      setPage('admin-dashboard');
      return true;
    } catch {
      if (form.username !== 'owner' || form.password !== 'bigbite123') return false;
      localStorage.setItem('bigbite-token', 'demo-owner-token');
      setToken('demo-owner-token');
      setPage('admin-dashboard');
      return true;
    }
  }

  async function changeStatus(id, status) {
    try {
      await apiJson(`/api/admin/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    } catch {
      const nextOrders = loadDemoOrders().map((order) => order.id === id ? { ...order, status } : order);
      saveDemoOrders(nextOrders);
      setOrders(nextOrders);
      return;
    }
    refreshOrders();
  }

  async function saveMenuItem(editingId, form) {
    try {
      const url = editingId ? `/api/admin/menu/${editingId}` : '/api/admin/menu';
      const method = editingId ? 'PUT' : 'POST';
      await apiJson(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } catch {
      const currentMenu = loadDemoMenu();
      const nextItem = {
        ...form,
        id: editingId || `item-${Date.now()}`,
        price: Number(form.price || 0)
      };
      const nextMenu = editingId
        ? currentMenu.map((item) => item.id === editingId ? { ...item, ...nextItem } : item)
        : [...currentMenu, nextItem];
      saveDemoMenu(nextMenu);
    }
    refreshMenu();
  }

  async function removeMenuItem(id) {
    try {
      await apiJson(`/api/admin/menu/${id}`, { method: 'DELETE' });
    } catch {
      saveDemoMenu(loadDemoMenu().filter((item) => item.id !== id));
    }
    refreshMenu();
  }

  function logout() {
    localStorage.removeItem('bigbite-token');
    setToken(null);
    setPage('home');
  }

  const requireAdmin = (children) => token ? children : <LoginPage login={login} />;

  return (
    <div className="min-h-screen bg-gray-50 text-bite-dark">
      <Header page={page} setPage={setPage} cartCount={cartCount} openCart={() => setCartOpen(true)} isAdmin={Boolean(token)} logout={logout} />
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'menu' && <MenuPage menu={menu} addToCart={addToCart} />}
      {page === 'checkout' && <CheckoutForm cart={cart} subtotal={subtotal} createOrder={createOrder} setPage={setPage} />}
      {page === 'success' && <SuccessPage order={successOrder} setPage={setPage} />}
      {page === 'admin-login' && <LoginPage login={login} />}
      {page === 'admin-dashboard' && requireAdmin(<AdminLayout page={page} setPage={setPage}><Dashboard orders={orders} filter={filter} setFilter={setFilter} changeStatus={changeStatus} /></AdminLayout>)}
      {page === 'admin-menu' && requireAdmin(<AdminLayout page={page} setPage={setPage}><MenuManagement menu={adminMenu} saveMenuItem={saveMenuItem} removeMenuItem={removeMenuItem} /></AdminLayout>)}
      <button onClick={() => setCartOpen(true)} className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-center gap-2 rounded-full bg-bite-red px-5 py-4 font-black text-white shadow-bite sm:hidden">
        <ShoppingBag size={20} />
        Cart ({cartCount}) - {money(subtotal)}
      </button>
      <Cart isOpen={cartOpen} closeCart={() => setCartOpen(false)} cart={cart} updateQuantity={updateQuantity} removeItem={(id) => setCart((current) => current.filter((item) => item.id !== id))} subtotal={subtotal} setPage={setPage} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
