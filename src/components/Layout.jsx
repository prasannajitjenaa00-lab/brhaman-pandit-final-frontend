import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GiLotusFlower } from 'react-icons/gi';
import { FiHeart as Heart, FiLogOut as LogOut, FiMenu as Menu, FiSearch as Search, FiShoppingCart as ShoppingCart, FiUser as User, FiX as X, FiGrid as LayoutDashboard } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Spinner } from './ui';
import { useSite } from '../context/SiteContext';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

export const Logo = ({ light = false }) => (
  <Link to="/" className="flex items-center gap-2.5" aria-label="Brahmam Pandit home">
    <GiLotusFlower size={42} className={light ? 'text-gold-300' : 'text-saffron-500'} />
    <span className="leading-tight">
      <span className={`block whitespace-nowrap font-serif text-lg font-bold tracking-wide sm:text-xl ${light ? 'text-gold-300' : 'text-maroon-700'}`}>BRAHMAM PANDIT</span>
      <span className={`hidden text-[11px] tracking-wide sm:block ${light ? 'text-cream-300' : 'text-brown-500'}`}>Divine Traditions, Trusted Pandits.</span>
    </span>
  </Link>
);

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/pujas', label: 'Puja Services' },
  { to: '/pandits', label: 'Book a Pandit' },
  { to: '/shop', label: 'Puja Samagri' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const wish = useWishlist();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    setOpen(false);
    setSearching(false);
  }, [pathname]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    setQ('');
  };

  const iconBtn = 'relative rounded-full p-2 text-maroon-700 hover:bg-maroon-50';
  const badge = (n) => n > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-white">{n}</span>;

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-50/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive ? 'bg-maroon-50 text-maroon-700' : 'text-brown-700 hover:text-maroon-600'}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button className={`${iconBtn} hidden lg:block`} aria-label="Search" onClick={() => setSearching((s) => !s)}><Search size={20} /></button>
          <Link to="/dashboard/wishlist" className={`${iconBtn} hidden lg:block`} aria-label="Wishlist"><Heart size={20} />{badge(wish.count)}</Link>
          <Link to="/cart" className={iconBtn} aria-label="Cart"><ShoppingCart size={20} />{badge(count)}</Link>
          {user ? (
            <div className="group relative hidden lg:block">
              <button className="ml-1 flex items-center gap-2 rounded-full bg-maroon-700 py-1.5 pl-1.5 pr-3 text-sm font-medium text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-maroon-900">{user.name[0]?.toUpperCase()}</span>
                {user.name.split(' ')[0]}
              </button>
              <div className="invisible absolute right-0 top-full w-48 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="card p-2">
                  <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cream-100"><LayoutDashboard size={15} /> Dashboard</Link>
                  {isAdmin && <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cream-100"><User size={15} /> Admin Panel</Link>}
                  <button onClick={async () => { await logout(); navigate('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cream-100"><LogOut size={15} /> Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm ml-1 hidden lg:inline-flex">Login</Link>
          )}
          <button className={`${iconBtn} lg:hidden`} aria-label="Menu" onClick={() => setOpen((o) => !o)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {searching && (
        <form onSubmit={submit} className="container-x hidden pb-3 lg:block">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Search Puja Samagri…" />
        </form>
      )}
      {open && (
        <div className="border-t border-cream-300 bg-cream-50 lg:hidden">
          <form onSubmit={submit} className="container-x pt-3"><input value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Search Puja Samagri…" /></form>
          <nav className="container-x flex flex-col py-3">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className="rounded-lg px-2 py-2.5 text-sm font-medium">{n.label}</NavLink>)}
            <Link to="/dashboard/wishlist" className="rounded-lg px-2 py-2.5 text-sm font-medium">Wishlist</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="rounded-lg px-2 py-2.5 text-sm font-medium">My Dashboard</Link>
                {isAdmin && <Link to="/admin" className="rounded-lg px-2 py-2.5 text-sm font-medium">Admin Panel</Link>}
                <button onClick={async () => { await logout(); navigate('/'); }} className="rounded-lg px-2 py-2.5 text-left text-sm font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary mt-2">Login / Register</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { settings: s } = useSite();
  const { contactEmail: email, contactPhone: phone } = s;
  const socials = [
    [FaFacebookF, s.facebook, 'Facebook'],
    [FaInstagram, s.instagram, 'Instagram'],
    [FaYoutube, s.youtube, 'YouTube'],
    [FaWhatsapp, s.whatsapp, 'WhatsApp'],
  ].filter(([, url]) => url);
  const heading = 'mb-3 font-sans text-sm font-semibold text-gold-300';
  const link = 'text-sm text-cream-200 hover:text-gold-300';
  return (
    <footer className="mt-10 bg-maroon-800 text-cream-200">
      <div className="container-x grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-cream-300">A modern Indian spiritual marketplace to book experienced Pandits and shop authentic Puja Samagri delivered to your doorstep.</p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2.5">
              {socials.map(([Icon, url, name]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} className="flex h-9 w-9 items-center justify-center rounded-lg border border-maroon-600 text-cream-100 hover:border-gold-400 hover:text-gold-300"><Icon size={15} /></a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className={heading}>Quick Links</h4>
          <ul className="space-y-2">{NAV.map((n) => <li key={n.to}><Link className={link} to={n.to}>{n.label}</Link></li>)}</ul>
        </div>
        <div>
          <h4 className={heading}>Customer Support</h4>
          <ul className="space-y-2">
            {[['FAQs', 'faqs'], ['Booking Policy', 'booking-policy'], ['Cancellation Policy', 'cancellation-policy'], ['Shipping Policy', 'shipping-policy'], ['Privacy Policy', 'privacy-policy'], ['Terms & Conditions', 'terms']].map(([l, slug]) => (
              <li key={slug}><Link className={link} to={`/info/${slug}`}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={heading}>Contact</h4>
          <ul className="space-y-2.5 text-sm">
            {email && <li className="flex items-center gap-2.5"><FiMail size={15} className="shrink-0" /> <a className="hover:text-gold-300" href={`mailto:${email}`}>{email}</a></li>}
            {phone && <li className="flex items-center gap-2.5"><FiPhone size={15} className="shrink-0" /> {phone}</li>}
            {s.address && <li className="flex items-center gap-2.5"><FiMapPin size={15} className="shrink-0" /> {s.address}</li>}
            {s.workingHours && <li className="flex items-center gap-2.5"><FiClock size={15} className="shrink-0" /> {s.workingHours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-maroon-600/50">
        <div className="container-x flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-cream-300">
          <span>© {new Date().getFullYear()} {s.siteName}. All rights reserved.</span>
          <span className="flex items-center gap-3"><Link to="/info/privacy-policy" className="hover:text-gold-300">Privacy Policy</Link><span aria-hidden="true">|</span><Link to="/info/terms" className="hover:text-gold-300">Terms &amp; Conditions</Link></span>
        </div>
      </div>
    </footer>
  );
}

const REVEAL_SELECTOR = 'main .card, main h1, main h2, main .eyebrow, main .reveal, main section > .container-x > p';

// Fades/slides elements in as they enter the viewport. Direction-aware: content scrolled
// past (above) re-enters from the top when you scroll back up, otherwise from below.
function useScrollReveal(deps) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target;
          if (e.isIntersecting) {
            el.classList.remove('rv-up');
            el.classList.add('rv-in');
          } else {
            el.classList.remove('rv-in');
            el.classList.toggle('rv-up', e.boundingClientRect.top < 0);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    const seen = new WeakSet();
    const scan = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const idx = [...el.parentElement.children].indexOf(el);
        el.style.setProperty('--rv-delay', `${Math.min(idx, 6) * 60}ms`);
        el.classList.add('rv');
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan); // content arrives after data loads
    mo.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function PublicLayout() {
  const { pathname } = useLocation();
  useScrollReveal([pathname]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

export function RequireAuth({ admin = false }) {
  const { user, loading } = useAuth();
  const { pathname, search } = useLocation();
  if (loading) return <Spinner className="min-h-screen items-center" />;
  if (!user) return <Navigate to="/login" replace state={{ from: pathname + search }} />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
