import { Link } from 'react-router-dom';
import { FaRegCalendarCheck as CalendarCheck, FaBoxOpen as PackageCheck, FaHandHoldingHeart as HeartHandshake } from 'react-icons/fa';
import { GiLotusFlower as Flower2 } from 'react-icons/gi';
import { FiShoppingBag as ShoppingBag, FiTruck as Truck, FiArrowRight as ArrowRight } from 'react-icons/fi';
import { MdVerified as BadgeCheck } from 'react-icons/md';
import { Img, SectionTitle, Spinner, useFetch } from '../components/ui';
import { ProductCard, PujaCard } from '../components/Cards';
import Hero from '../components/Hero';

const SERVICES = [
  { icon: CalendarCheck, title: 'Book a Pandit', text: 'Find experienced Pandits for your ceremony.', to: '/pandits' },
  { icon: Flower2, title: 'Puja Services', text: 'Explore different Puja and religious ceremonies.', to: '/pujas' },
  { icon: ShoppingBag, title: 'Puja Samagri', text: 'Shop complete Puja kits and individual items.', to: '/shop' },
  { icon: PackageCheck, title: 'Complete Puja Package', text: 'Book a Pandit with recommended Puja Samagri.', to: '/pujas' },
];

export default function Home() {
  const pujas = useFetch('/pujas');
  const products = useFetch('/products', { limit: 8, sort: 'rating' });
  const cats = useFetch('/categories');

  return (
    <>
      <Hero />

      {/* Quick services */}
      <section className="container-x pb-4 pt-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link key={s.title} to={s.to} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-50 text-saffron-600 transition group-hover:bg-maroon-700 group-hover:text-gold-300"><s.icon size={24} /></span>
              <h3 className="mt-4 text-lg">{s.title}</h3>
              <p className="mt-1 text-sm text-brown-500">{s.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-maroon-600">Explore <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular pujas */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Puja Services" title="Popular Pujas" subtitle="From housewarmings to weddings — performed by experienced Pandits, the traditional way." />
          {pujas.loading ? <Spinner /> : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {pujas.data?.items.slice(0, 10).map((p) => <PujaCard key={p._id} puja={p} />)}
            </div>
          )}
          <div className="mt-8 text-center"><Link to="/pujas" className="btn-outline">View all Pujas</Link></div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white section">
        <div className="container-x">
          <SectionTitle eyebrow="Puja Samagri" title="Shop by Category" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {cats.data?.items.map((c) => (
              <Link key={c._id} to={`/shop?category=${c.slug}`} className="group rounded-2xl border border-cream-200 bg-cream-50 p-4 text-center transition hover:border-gold-400 hover:shadow-soft">
                <Img src={c.image} alt={c.name} icon={ShoppingBag} className="mx-auto h-16 w-16 rounded-full" />
                <p className="mt-3 text-sm font-semibold text-brown-800 group-hover:text-maroon-600">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Bestsellers" title="Authentic Puja Samagri" subtitle="Quality-checked essentials for every ritual, delivered to your doorstep." />
          {products.loading ? <Spinner /> : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {products.data?.items.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div className="mt-8 text-center"><Link to="/shop" className="btn-primary">Visit the Shop</Link></div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-maroon-800 py-16 text-cream-100">
        <div className="container-x">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-2 !text-gold-400">Simple &amp; Transparent</p>
            <h2 className="text-3xl !text-gold-300 sm:text-4xl">How Booking Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[['1', 'Choose a Puja', 'Pick the ceremony and a Pandit that suits you.'], ['2', 'Select date & time', 'Choose a convenient slot and share your location.'], ['3', 'Get confirmation', 'Our team confirms and assigns the Pandit.'], ['4', 'Perform the Puja', 'The Pandit arrives with devotion. Samagri can be delivered too.']].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-maroon-600/60 bg-maroon-700/40 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-maroon-900">{n}</span>
                <h3 className="mt-4 text-lg !text-cream-50">{t}</h3>
                <p className="mt-1 text-sm text-cream-300">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section">
        <div className="container-x grid grid-cols-1 gap-6 md:grid-cols-3">
          {[[BadgeCheck, 'Verified Pandits', 'Every Pandit is manually verified with ID and address proof.'], [HeartHandshake, 'Respectful & Transparent', 'Clear pricing and clear communication, from booking to completion.'], [Truck, 'Delivered with Care', 'Pay on delivery — no advance needed for Puja Samagri.']].map(([I, t, d]) => (
            <div key={t} className="card flex gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-maroon-50 text-maroon-600"><I size={24} /></span>
              <div><h3 className="text-lg">{t}</h3><p className="mt-1 text-sm text-brown-500">{d}</p></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
