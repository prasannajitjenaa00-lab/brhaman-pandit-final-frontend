import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin, FiStar, FiCalendar, FiShield, FiAward } from 'react-icons/fi';
import { FaRupeeSign, FaOm, FaLanguage, FaUserClock } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';
import { MdOutlineGTranslate, MdOutlinePublic } from 'react-icons/md';
import { BannerPhoto, Empty, ErrorBox, Pagination, PriceRangeSlider, Spinner, ViewToggle, useFetch } from '../components/ui';
import { PanditCard } from '../components/Cards';

const BANNER = '/pandits-banner.jpg'; // replace the file in frontend/public to change the banner photo
const PAGE_SIZE = 6;

const FEATURES = [
  { icon: FiShield, title: 'Verified Pandits', text: 'Background checked' },
  { icon: FiAward, title: 'Experienced', text: 'Years of expertise' },
  { icon: MdOutlineGTranslate, title: 'Multiple Languages', text: 'Hindi, Sanskrit & more' },
  { icon: MdOutlinePublic, title: 'Wide Coverage', text: 'All major cities' },
];

const Label = ({ icon: Icon, children }) => (
  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-brown-800"><Icon size={16} className="text-maroon-600" /> {children}</span>
);


export default function Pandits() {
  const [sp, setSp] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState('grid');
  const f = Object.fromEntries(sp.entries());
  const page = Number(f.page) || 1;

  // Languages and price bounds come from the live Pandit data.
  const opts = useFetch('/pandits/filters');
  const priceMin = opts.data?.minPrice ?? 0;
  const priceMax = opts.data?.maxPrice ?? 0;
  const languages = opts.data?.languages || [];

  // Sidebar filters are drafted locally and applied with the "Apply Filters" button.
  // The draft is keyed to the URL so it resets whenever the applied filters change.
  const urlKey = sp.toString();
  const fromUrl = () => ({
    location: f.location || '', puja: f.puja || '', language: f.language || '', minExperience: f.minExperience || '', minRating: f.minRating || '',
    available: f.available === 'true', price: [Number(f.minPrice) || priceMin, Number(f.maxPrice) || priceMax],
  });
  const [draftState, setDraftState] = useState({ key: urlKey, value: null });
  const draft = draftState.key === urlKey && draftState.value ? draftState.value : fromUrl();
  const setDraft = (next) => setDraftState({ key: urlKey, value: typeof next === 'function' ? next(draft) : next });

  const pujas = useFetch('/pujas');
  const { data, loading, error } = useFetch('/pandits', { ...f, limit: PAGE_SIZE });

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v === undefined || v === false ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setSp(next);
  };

  const apply = (e) => {
    e?.preventDefault();
    update({
      location: draft.location.trim(), puja: draft.puja, language: draft.language, minExperience: draft.minExperience, minRating: draft.minRating,
      available: draft.available ? 'true' : '', minPrice: draft.price[0] > priceMin ? draft.price[0] : '', maxPrice: draft.price[1] < priceMax ? draft.price[1] : '',
    });
    setShowFilters(false);
  };
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const pages = data?.pages || 1;

  return (
    <>
      {/* banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-[#fdf3df] to-cream-200">
        <GiLotusFlower className="pointer-events-none absolute -left-16 -top-6 h-72 w-72 text-gold-400/10" aria-hidden="true" />
        <BannerPhoto src={BANNER} alt="A Pandit seated before brass lamps" className="aspect-[386/234]" fade={45} breakpoint="xl:block" />
        <div className="container-x relative py-10 text-center sm:py-12">
          <p className="mb-2 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-600"><span aria-hidden="true">◆</span> Book a Pandit <span aria-hidden="true">◆</span></p>
          <h1 className="font-serif text-4xl font-bold text-maroon-800 sm:text-5xl lg:text-6xl">Find Your Pandit</h1>
          <p className="mt-3 text-lg text-brown-600">Experienced, verified Pandits for every ceremony.</p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-left">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-maroon-600 shadow-soft"><Icon size={20} /></span>
                <span className="text-sm leading-tight"><span className="block font-semibold text-brown-800">{title}</span><span className="text-xs text-brown-500">{text}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container-x py-8">
        <button className="btn-outline mb-4 lg:hidden" onClick={() => setShowFilters((s) => !s)}><FiFilter size={15} /> Filters</button>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_1fr]">
          {/* filters */}
          <form onSubmit={apply} className={`${showFilters ? 'block' : 'hidden'} card h-fit space-y-5 p-5 lg:sticky lg:top-24 lg:block`}>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-maroon-800"><FiFilter className="text-maroon-600" /> Filters</h2>
              <button type="button" className="text-xs font-semibold text-maroon-600 hover:underline" onClick={() => setSp({})}>Clear All</button>
            </div>
            <div>
              <Label icon={FiMapPin}>Location</Label>
              <div className="relative"><FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" /><input className="input pl-9" placeholder="Enter city or state" value={draft.location} onChange={set('location')} /></div>
            </div>
            <div>
              <Label icon={FaOm}>Puja Specialization</Label>
              <select className="input" value={draft.puja} onChange={set('puja')}><option value="">All Specializations</option>{pujas.data?.items.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
            </div>
            <div>
              <Label icon={FaLanguage}>Language</Label>
              <select className="input" value={draft.language} onChange={set('language')}><option value="">All Languages</option>{languages.map((l) => <option key={l}>{l}</option>)}</select>
            </div>
            <div>
              <Label icon={FaUserClock}>Experience</Label>
              <select className="input" value={draft.minExperience} onChange={set('minExperience')}><option value="">Any Experience</option><option value="5">5+ years</option><option value="10">10+ years</option><option value="20">20+ years</option></select>
            </div>
            <div>
              <Label icon={FiStar}>Rating</Label>
              <select className="input" value={draft.minRating} onChange={set('minRating')}><option value="">Any Rating</option><option value="4">4.0 &amp; up</option><option value="4.5">4.5 &amp; up</option></select>
            </div>
            <div>
              <Label icon={FiCalendar}>Availability</Label>
              <label className="flex items-center gap-2 text-sm text-brown-600"><input type="checkbox" className="h-4 w-4 accent-maroon-600" checked={draft.available} onChange={(e) => setDraft({ ...draft, available: e.target.checked })} /> Available for booking only</label>
            </div>
            <div>
              <Label icon={FaRupeeSign}>Price Range (₹)</Label>
              {priceMax > priceMin && <PriceRangeSlider min={priceMin} max={priceMax} step={100} value={draft.price} onChange={(price) => setDraft((d) => ({ ...d, price }))} />}
            </div>
            <button className="btn-primary w-full py-3"><FiSearch /> Apply Filters</button>
          </form>

          {/* results */}
          <div className="min-w-0">
            <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
              <div className="relative min-w-[200px] flex-1">
                <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-400" />
                <input key={f.q || ''} className="input pl-10" placeholder="Search by name, location or specialization…" defaultValue={f.q || ''} aria-label="Search Pandits" onKeyDown={(e) => e.key === 'Enter' && update({ q: e.target.value.trim() })} onBlur={(e) => e.target.value.trim() !== (f.q || '') && update({ q: e.target.value.trim() })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-brown-600">Sort by
                <select className="input w-auto" value={f.sort || ''} onChange={(e) => update({ sort: e.target.value })}>
                  <option value="">Recommended</option><option value="rating">Top rated</option><option value="experience">Most experienced</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
                </select>
              </label>
              <span className="ml-auto text-sm text-brown-600">Showing <strong>{data?.total ?? '…'}</strong> Pandits</span>
              <ViewToggle value={view} onChange={setView} />
            </div>

            {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : data.items.length === 0 ? <Empty title="No Pandits match your filters" text="Try removing a filter or searching another location." /> : (
              <>
                <div className={`grid gap-4 ${view === 'grid' ? 'md:grid-cols-2 min-[1700px]:grid-cols-3' : ''}`}>{data.items.map((p) => <PanditCard key={p._id} pandit={p} />)}</div>
                <Pagination numbered page={page} pages={pages} onChange={(n) => update({ page: n })} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
