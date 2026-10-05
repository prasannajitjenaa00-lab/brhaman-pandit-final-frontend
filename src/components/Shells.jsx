import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid as LayoutDashboard, FiPackage as Package, FiHeart as Heart, FiMapPin as MapPin, FiUser as User, FiKey as KeyRound, FiLogOut as LogOut, FiUsers as Users, FiShoppingBag as ShoppingBag, FiTag as Tags, FiStar as Star, FiBarChart2 as BarChart3, FiSettings as Settings, FiMenu as Menu, FiHome as Home, FiBell as Bell } from 'react-icons/fi';
import { FaRegCalendarCheck as CalendarCheck, FaBoxes as Boxes, FaTicketAlt as Ticket, FaUserTie as BookUser } from 'react-icons/fa';
import { GiLotusFlower as Flower2 } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Layout';
import api from '../lib/api';
import { fmtDateTime } from '../lib/format';

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-maroon-700 text-white shadow-soft' : 'text-brown-700 hover:bg-maroon-50'}`;

// ---------------- User dashboard shell ----------------
const USER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: CalendarCheck },
  { to: '/dashboard/orders', label: 'My Orders', icon: Package },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/dashboard/addresses', label: 'Saved Addresses', icon: MapPin },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/password', label: 'Change Password', icon: KeyRound },
];

export function DashboardShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="container-x py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="card h-fit min-w-0 p-3 lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Dashboard">
            {USER_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={(s) => `${linkCls(s)} shrink-0 whitespace-nowrap`}>
                <n.icon size={17} /> {n.label}
              </NavLink>
            ))}
            <button onClick={async () => { await logout(); navigate('/'); }} className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium text-brown-700 hover:bg-maroon-50">
              <LogOut size={17} /> Logout
            </button>
          </nav>
        </aside>
        <section className="min-w-0"><Outlet /></section>
      </div>
    </div>
  );
}

// ---------------- Admin shell (completely separate layout) ----------------
const ADMIN_NAV = [
  { group: null, items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  { group: 'People', items: [{ to: '/admin/users', label: 'Users', icon: Users }, { to: '/admin/pandits', label: 'Pandits', icon: BookUser }] },
  { group: 'Catalog', items: [
    { to: '/admin/pujas', label: 'Puja Services', icon: Flower2 },
    { to: '/admin/products', label: 'Products', icon: ShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  ] },
  { group: 'Sales', items: [{ to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck }, { to: '/admin/orders', label: 'Orders', icon: Package }] },
  { group: 'Engagement', items: [
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { to: '/admin/messages', label: 'Enquiries', icon: Bell },
  ] },
  { group: 'System', items: [{ to: '/admin/reports', label: 'Reports', icon: BarChart3 }, { to: '/admin/settings', label: 'Settings', icon: Settings }] },
];

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState({ items: [], unread: 0 });
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const load = () => api.get('/admin/notifications').then((r) => setNotes(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col bg-maroon-800 text-cream-200">
      <div className="border-b border-maroon-600/50 p-5"><Logo light /><p className="mt-1 text-[11px] uppercase tracking-widest text-cream-300">Admin Panel</p></div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3" aria-label="Admin">
        {ADMIN_NAV.map((g, i) => (
          <div key={i}>
            {g.group && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400/80">{g.group}</p>}
            {g.items.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-gold-400 font-semibold text-maroon-900' : 'hover:bg-maroon-700'}`}>
                <n.icon size={16} /> {n.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-maroon-600/50 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-maroon-700"><Home size={16} /> View Website</Link>
        <button onClick={async () => { await logout(); navigate('/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-maroon-700"><LogOut size={16} /> Logout</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100 lg:grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-maroon-900/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-cream-300 bg-cream-50/95 px-4 backdrop-blur sm:px-6">
          <button className="rounded-full p-2 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <span className="hidden text-sm text-brown-500 lg:block">Signed in as <strong className="text-brown-800">{user?.name}</strong></span>
          <div className="relative">
            <button className="relative rounded-full p-2 hover:bg-cream-200" aria-label="Notifications" onClick={() => { setShowNotes((s) => !s); if (notes.unread) api.post('/admin/notifications/read').then(() => setNotes((n) => ({ ...n, unread: 0 }))); }}>
              <Bell size={19} />
              {notes.unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon-600 px-1 text-[10px] font-bold text-white">{notes.unread}</span>}
            </button>
            {showNotes && (
              <div className="card absolute right-0 top-full z-40 mt-2 max-h-96 w-80 overflow-y-auto p-2">
                {notes.items.length === 0 && <p className="p-4 text-center text-sm text-brown-500">No notifications</p>}
                {notes.items.map((n) => (
                  <Link key={n._id} to={n.link || '/admin'} onClick={() => setShowNotes(false)} className="block rounded-lg px-3 py-2 hover:bg-cream-100">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-brown-500">{n.message}</p>
                    <p className="text-[11px] text-brown-400">{fmtDateTime(n.createdAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
