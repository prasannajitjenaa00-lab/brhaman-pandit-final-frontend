import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingCart, FiShield, FiTruck, FiUser, FiPackage } from 'react-icons/fi';
import { FaRegCalendarCheck, FaLeaf } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';
import { BannerPhoto } from './ui';

// Drop a better photo at frontend/public/hero-pandit.jpg to replace the hero image (no code change needed).
const HERO_IMAGE = '/hero-pandit.jpg';

const OM = () => <span className="font-serif text-2xl leading-none" aria-hidden="true">ॐ</span>;

const PANEL = [
  { icon: OM, title: 'Puja Services', text: 'Find the right Puja', to: '/pujas' },
  { icon: FiUser, title: 'Book a Pandit', text: 'Experienced & Verified', to: '/pandits' },
  { icon: FiShoppingCart, title: 'Puja Samagri', text: 'Complete Puja Kits', to: '/shop' },
  { icon: FiPackage, title: 'Complete Package', text: 'Pandit + Samagri', to: '/pujas' },
];

const TRUST = [
  { icon: FiShield, lines: ['Verified', 'Pandits'] },
  { icon: FaLeaf, lines: ['Authentic', 'Samagri'] },
  { icon: FiTruck, lines: ['Doorstep', 'Delivery'] },
];

const Ornament = ({ flip }) => (
  <svg width="64" height="14" viewBox="0 0 64 14" className={flip ? '-scale-x-100' : ''} aria-hidden="true">
    <path d="M0 7h44" stroke="#d9a441" strokeWidth="1" />
    <path d="M52 1l5 6-5 6-5-6z" fill="none" stroke="#d9a441" strokeWidth="1.2" />
    <circle cx="52" cy="7" r="1.6" fill="#d9a441" />
  </svg>
);

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-[#fdf3df] to-cream-200">
      {/* faint mandala watermark */}
      <GiLotusFlower className="pointer-events-none absolute -left-24 top-10 h-[28rem] w-[28rem] text-gold-400/10" aria-hidden="true" />

      {/* photo on the right, fading into the cream background */}
      <BannerPhoto src={HERO_IMAGE} alt="A Pandit performing Puja with brass lamps, flowers and offerings" className="aspect-[675/686]" position="bg-center" fade={45} />

      <div className="container-x relative grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:min-h-[36rem] lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.22em] text-saffron-600">
            <span className="hidden sm:inline"><Ornament /></span> Divine Traditions, Trusted Pandits <span className="hidden sm:inline"><Ornament flip /></span>
          </p>
          <h1 className="font-serif text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-maroon-800 to-maroon-500 bg-clip-text text-transparent">Bring Divine</span>
            <br />
            <span className="bg-gradient-to-r from-saffron-600 via-gold-600 to-saffron-500 bg-clip-text text-transparent">Traditions Home.</span>
          </h1>
          <div className="my-5 flex items-center gap-1.5" aria-hidden="true"><span className="h-0.5 w-14 bg-maroon-600" /><span className="h-1.5 w-1.5 rounded-full bg-maroon-600" /><span className="h-1.5 w-1.5 rounded-full bg-gold-500" /></div>
          <p className="max-w-md text-lg text-brown-600">Book trusted Pandits for your Puja and shop authentic Puja Samagri — all in one place.</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/pandits" className="btn bg-gradient-to-b from-maroon-600 to-maroon-800 px-7 py-4 text-base text-white shadow-lift hover:from-maroon-700">
              <FaRegCalendarCheck /> Book a Pandit <FiArrowRight />
            </Link>
            <Link to="/shop" className="btn border border-gold-500 bg-white/60 px-7 py-4 text-base text-maroon-700 hover:bg-white">
              <FiShoppingCart /> Explore Puja Samagri <FiArrowRight />
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-y-4">
            {TRUST.map(({ icon: Icon, lines }, i) => (
              <li key={lines[0]} className={`flex items-center gap-3 sm:pr-6 ${i < TRUST.length - 1 ? 'sm:mr-6 sm:border-r sm:border-gold-400/50' : ''}`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/80 text-maroon-600 shadow-soft"><Icon size={20} /></span>
                <span className="text-sm font-medium leading-tight text-brown-800">{lines[0]}<br />{lines[1]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* arch-shaped service panel */}
        <nav aria-label="Services" className="relative mx-auto w-full max-w-xs lg:mx-0 lg:ml-auto lg:-translate-x-20">
          <div className="rounded-t-[999px] rounded-b-[2.5rem] border border-gold-400/50 bg-cream-50/85 px-6 pb-7 pt-20 shadow-lift backdrop-blur-md">
            <ul className="space-y-4">
              {PANEL.map(({ icon: Icon, title, text, to }) => (
                <li key={title}>
                  <Link to={to} className="group flex items-center gap-4 rounded-2xl p-1 transition hover:bg-white/70">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-saffron-100/70 text-maroon-700 transition group-hover:bg-maroon-700 group-hover:text-gold-300"><Icon size={24} /></span>
                    <span>
                      <span className="block font-serif text-base font-semibold text-maroon-800">{title}</span>
                      <span className="block text-xs text-brown-500">{text}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* mobile/tablet: photo below the content */}
      <div className="h-64 bg-cover bg-center sm:h-80 lg:hidden" style={{ backgroundImage: `url(${HERO_IMAGE})` }} role="img" aria-label="A Pandit performing Puja" />
    </section>
  );
}
