import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { GiLotusFlower } from 'react-icons/gi';
import { FaHome, FaHeartbeat, FaRing, FaOm } from 'react-icons/fa';
import { MdOutlineCelebration } from 'react-icons/md';
import { BannerPhoto, Empty, ErrorBox, Spinner, useFetch } from '../components/ui';
import { useSite } from '../context/SiteContext';
import { PujaCard } from '../components/Cards';

const BANNER = '/pujas-banner.jpg'; // replace the file in frontend/public to change the banner photo

const CATEGORY_ICONS = {
  'Home & Family': FaHome, 'Health & Prosperity': FaHeartbeat, 'Marriage & Life Events': FaRing,
  'Spiritual & Vedic': FaOm, 'Other Ceremonies': MdOutlineCelebration,
};

export default function Pujas() {
  const { meta } = useSite();
  const categories = [{ label: 'All Pujas', value: '', icon: GiLotusFlower }, ...meta.pujaCategories.map((c) => ({ label: c, value: c, icon: CATEGORY_ICONS[c] || GiLotusFlower }))];
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const { data, loading, error } = useFetch('/pujas', { q: q || undefined, category: category || undefined });

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-[#fdf3df] to-cream-200">
        <GiLotusFlower className="pointer-events-none absolute -left-20 top-0 h-80 w-80 text-gold-400/10" aria-hidden="true" />
        <BannerPhoto src={BANNER} alt="Brass lamps, flowers and offerings arranged for a Puja" className="aspect-[436/316]" fade={40} />
        <div className="container-x relative py-10 sm:py-14">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-saffron-600"><span className="text-lg leading-none">+</span> Puja Services</p>
          <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl">
            <span className="text-maroon-800">Explore </span>
            <span className="bg-gradient-to-r from-saffron-600 to-gold-600 bg-clip-text text-transparent">Puja Services</span>
          </h1>
          <p className="mt-3 text-brown-600">Choose a ceremony to see details, benefits and the Samagri you will need.</p>

          <div className="relative mt-6 max-w-xl">
            <FiSearch size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-brown-400" />
            <input className="w-full rounded-full border border-cream-300 bg-white/90 py-3.5 pl-12 pr-5 text-sm shadow-soft placeholder:text-brown-400 focus:border-saffron-500 focus:outline-none focus:ring-2 focus:ring-saffron-100" placeholder="Search Pujas (e.g. Ganesh Puja, Griha Pravesh, Havan…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search Pujas" />
          </div>

          <div className="mt-6 flex max-w-4xl flex-wrap gap-2.5" role="tablist" aria-label="Puja categories">
            {categories.map(({ label, value, icon: Icon }) => {
              const on = category === value;
              return (
                <button key={label} role="tab" aria-selected={on} onClick={() => setCategory(value)} className={`btn gap-2 px-4 py-2 text-xs ${on ? 'bg-gradient-to-b from-maroon-600 to-maroon-800 text-white shadow-soft' : 'border border-cream-300 bg-white/80 text-brown-700 hover:border-gold-400'}`}>
                  <Icon size={15} className={on ? 'text-gold-300' : 'text-maroon-600'} /> {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : data.items.length === 0 ? <Empty title="No Pujas found" text="Try a different search or category." /> : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{data.items.map((p) => <PujaCard key={p._id} puja={p} />)}</div>
        )}
      </div>
    </>
  );
}
