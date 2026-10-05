import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiGrid, FiGift, FiChevronRight, FiShield, FiTruck, FiPackage, FiShoppingCart, FiFilter } from 'react-icons/fi';
import { GiIncense, GiFireBowl, GiCandleFlame, GiAmphora, GiCauldron, GiPrayerBeads, GiMeditation, GiOpenBook, GiCampfire, GiLotusFlower } from 'react-icons/gi';
import { MdOutlineInventory2 } from 'react-icons/md';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { BannerPhoto, Empty, ErrorBox, Pagination, PriceRangeSlider, Spinner, ViewToggle, useFetch } from '../components/ui';
import { ProductCard } from '../components/Cards';

const BANNER = '/shop-banner.jpg'; // replace the file in frontend/public to change the banner photo
const PAGE_SIZE = 12;

const CATEGORY_ICONS = {
  'puja-kits': FiGift, incense: GiIncense, camphor: GiFireBowl, diyas: GiCandleFlame, kalash: GiAmphora, 'puja-thali': GiCauldron,
  rudraksha: GiPrayerBeads, idols: GiMeditation, 'religious-books': GiOpenBook, 'havan-samagri': GiCampfire, 'decorative-items': GiLotusFlower,
};

const CATEGORY_ORDER = ['puja-kits', 'incense', 'camphor', 'diyas', 'havan-samagri', 'kalash', 'idols', 'puja-thali', 'decorative-items', 'religious-books', 'rudraksha'];
const rank = (slug) => (CATEGORY_ORDER.includes(slug) ? CATEGORY_ORDER.indexOf(slug) : 99);

const FEATURES = [
  { icon: FiShield, title: 'Authentic Products', text: 'High quality samagri' },
  { icon: FiTruck, title: 'Doorstep Delivery', text: 'Across India' },
  { icon: FiPackage, title: 'Secure Packaging', text: 'Safe & hygienic' },
  { icon: GiLotusFlower, title: 'Wide Collection', text: 'Kits and individual items' },
];

const DISCOUNTS = [10, 20, 30];
const RATINGS = [4.5, 4, 3.5, 3];

const Heading = ({ children }) => <h3 className="mb-3 font-sans text-sm font-bold text-brown-900">{children}</h3>;

const Check = ({ checked, onChange, children }) => (
  <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-brown-700">
    <input type="checkbox" className="h-4 w-4 rounded accent-maroon-600" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {children}
  </label>
);

const StarRow = ({ n }) => (
  <span className="flex text-gold-500" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => (i <= Math.floor(n) ? <FaStar key={i} size={13} /> : <FaRegStar key={i} size={13} className="text-cream-300" />))}</span>
);

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const strip = useRef(null);
  const f = Object.fromEntries(sp.entries());
  const page = Number(f.page) || 1;
  const selected = f.category ? f.category.split(',') : [];

  const catsRes = useFetch('/categories');
  const categories = [...(catsRes.data?.items || [])].sort((a, b) => rank(a.slug) - rank(b.slug));
  const { data, loading, error } = useFetch('/products', { ...f, limit: PAGE_SIZE });

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v === undefined || v === false || v === null ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setSp(next);
  };
  const toggleCat = (slug, on) => update({ category: (on ? [...selected, slug] : selected.filter((s) => s !== slug)).join(',') });

  // Price bounds come from the catalog itself; the slider holds a draft while dragging and commits on release.
  const bounds = useFetch('/products/filters');
  const priceMin = bounds.data?.minPrice ?? 0;
  const priceMax = bounds.data?.maxPrice ?? 0;
  const [draftPrice, setDraftPrice] = useState(null);
  const price = draftPrice || [Number(f.minPrice) || priceMin, Number(f.maxPrice) || priceMax];
  const commitPrice = () => {
    if (!draftPrice) return;
    update({ minPrice: draftPrice[0] > priceMin ? draftPrice[0] : '', maxPrice: draftPrice[1] < priceMax ? draftPrice[1] : '' });
    setDraftPrice(null);
  };

  const pages = data?.pages || 1;
  const scrollStrip = () => strip.current?.scrollBy({ left: 320, behavior: 'smooth' });

  return (
    <>
      {/* banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-[#fdf3df] to-cream-200">
        <GiLotusFlower className="pointer-events-none absolute -left-16 top-0 h-72 w-72 text-gold-400/10" aria-hidden="true" />
        <BannerPhoto src={BANNER} alt="Ganesha idol with brass lamps, incense and marigold flowers" className="aspect-[449/266]" fade={40} />
        <div className="container-x relative py-10 sm:py-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-600">Puja Samagri</p>
          <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl">
            <span className="text-maroon-800">Shop </span>
            <span className="bg-gradient-to-r from-saffron-600 to-gold-600 bg-clip-text text-transparent">Puja Samagri</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-brown-700">Complete Puja kits and individual items — delivered to your doorstep.</p>
          <ul className="mt-7 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col gap-1.5 sm:border-r sm:border-gold-400/40 sm:pr-4 sm:last:border-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100/70 text-maroon-600"><Icon size={20} /></span>
                <span className="text-sm font-semibold text-brown-900">{title}</span>
                <span className="text-xs text-brown-500">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* category strip */}
      <div className="border-b border-cream-300 bg-cream-50">
        <div className="container-x flex items-center gap-2 py-3">
          <div ref={strip} className="flex flex-1 gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Product categories">
            <button role="tab" aria-selected={selected.length === 0} onClick={() => update({ category: '' })} className={`flex h-[4.5rem] min-w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition ${selected.length === 0 ? 'border-maroon-700 bg-maroon-700 text-white shadow-soft' : 'border-cream-300 bg-white text-brown-700 hover:border-gold-400'}`}>
              <FiGrid size={20} /> All
            </button>
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.slug] || MdOutlineInventory2;
              const on = selected.includes(c.slug);
              return (
                <button key={c._id} role="tab" aria-selected={on} onClick={() => toggleCat(c.slug, !on)} className={`flex h-[4.5rem] min-w-[5.5rem] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition ${on ? 'border-maroon-700 bg-maroon-700 text-white shadow-soft' : 'border-cream-300 bg-white text-brown-700 hover:border-gold-400'}`}>
                  <Icon size={20} className={on ? 'text-gold-300' : 'text-maroon-600'} /> <span className="whitespace-nowrap">{c.name}</span>
                </button>
              );
            })}
          </div>
          <button onClick={scrollStrip} aria-label="Scroll categories" className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-brown-700 shadow-soft hover:border-gold-400 sm:flex"><FiChevronRight /></button>
        </div>
      </div>

      <div className="container-x py-8">
        <button className="btn-outline mb-4 lg:hidden" onClick={() => setShowFilters((s) => !s)}><FiFilter size={15} /> Filters</button>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} card h-fit space-y-6 p-5 lg:sticky lg:top-24 lg:block`} aria-label="Filters">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h2 className="flex items-center gap-2 font-sans text-base font-bold text-maroon-800"><FiShoppingCart className="text-maroon-600" /> Filters</h2>
              <button className="text-xs font-semibold text-maroon-600 hover:underline" onClick={() => setSp(f.q ? { q: f.q } : {})}>Clear All</button>
            </div>

            <div>
              <Heading>Price Range</Heading>
              {priceMax > priceMin && <PriceRangeSlider min={priceMin} max={priceMax} step={50} value={price} onChange={setDraftPrice} onCommit={commitPrice} />}
            </div>

            <div>
              <Heading>Categories</Heading>
              {categories.map((c) => (
                <Check key={c._id} checked={selected.includes(c.slug)} onChange={(on) => toggleCat(c.slug, on)}>{c.name} <span className="text-brown-400">({c.productCount})</span></Check>
              ))}
            </div>

            <div>
              <Heading>Availability</Heading>
              <Check checked={f.inStock === 'true'} onChange={(on) => update({ inStock: on ? 'true' : '' })}>In Stock Only</Check>
            </div>

            <div>
              <Heading>Discount</Heading>
              {DISCOUNTS.map((d) => <Check key={d} checked={Number(f.minDiscount) === d} onChange={(on) => update({ minDiscount: on ? d : '' })}>{d}% or more</Check>)}
            </div>

            <div>
              <Heading>Rating</Heading>
              {RATINGS.map((r) => (
                <Check key={r} checked={Number(f.minRating) === r} onChange={(on) => update({ minRating: on ? r : '' })}>
                  <StarRow n={r} /> <span>{r.toFixed(1)} &amp; above</span>
                </Check>
              ))}
            </div>
          </aside>

          {/* results */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="card relative min-w-[200px] flex-1 !rounded-xl">
                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-400" />
                <input key={f.q || ''} className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-100" placeholder="Search for products (e.g. Puja kit, Camphor, Kalash…)" defaultValue={f.q || ''} aria-label="Search products" onKeyDown={(e) => e.key === 'Enter' && update({ q: e.target.value.trim() })} onBlur={(e) => e.target.value.trim() !== (f.q || '') && update({ q: e.target.value.trim() })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-brown-600">Sort by
                <select className="input w-auto" value={f.sort || ''} onChange={(e) => update({ sort: e.target.value })}>
                  <option value="">Newest First</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Top Rated</option><option value="discount">Biggest Discount</option>
                </select>
              </label>
              <ViewToggle value={view} onChange={setView} />
            </div>
            <p className="mb-3 text-sm text-brown-600">Showing <strong>{data?.total ?? '…'}</strong> products</p>

            {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : data.items.length === 0 ? <Empty title="No products found" text="Try different filters or a different search." /> : (
              <>
                <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 xl:grid-cols-3 min-[1500px]:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>{data.items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
                <Pagination numbered page={page} pages={pages} onChange={(n) => update({ page: n })} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
