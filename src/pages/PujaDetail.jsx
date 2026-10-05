import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle as CheckCircle2, FiClock as Clock, FiGlobe as Globe, FiMapPin as MapPin } from 'react-icons/fi';
import { MdChecklist as ListChecks } from 'react-icons/md';
import { ErrorBox, Img, Spinner, useFetch } from '../components/ui';
import { ProductCard } from '../components/Cards';
import { money } from '../lib/format';

export default function PujaDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/pujas/${slug}`);
  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-16"><ErrorBox message={error} /></div>;
  const { puja, pandits } = data;

  return (
    <div className="container-x py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Img src={puja.image} alt={puja.name} className="aspect-[4/3] w-full rounded-3xl shadow-soft" />
        <div>
          <p className="eyebrow">Puja Service</p>
          <h1 className="mt-1 text-4xl font-semibold">{puja.name}</h1>
          <p className="mt-4 text-brown-600">{puja.description || puja.shortDescription}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="card flex items-center gap-2 p-3"><Clock size={16} className="text-saffron-600" /> {puja.duration || 'Flexible'}</div>
            <div className="card flex items-center gap-2 p-3"><Globe size={16} className="text-saffron-600" /> {puja.languages?.join(', ') || '—'}</div>
            <div className="card col-span-2 flex items-start gap-2 p-3"><MapPin size={16} className="mt-0.5 shrink-0 text-saffron-600" /> {puja.locations?.length ? puja.locations.join(', ') : 'Available across India'}</div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-brown-400">Starting from</p>
              <p className="text-3xl font-bold text-maroon-700">{money(puja.priceFrom)}</p>
            </div>
            <Link to={`/book?puja=${puja._id}`} className="btn-primary px-8 py-3 text-base">Book This Puja</Link>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {puja.benefits?.length > 0 && (
          <div className="card p-6">
            <h2 className="mb-4 text-xl">Benefits</h2>
            <ul className="space-y-2.5">{puja.benefits.map((b) => <li key={b} className="flex gap-2.5 text-sm"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />{b}</li>)}</ul>
          </div>
        )}
        {puja.requiredSamagri?.length > 0 && (
          <div className="card p-6">
            <h2 className="mb-4 text-xl">Required Samagri</h2>
            <ul className="space-y-2.5">{puja.requiredSamagri.map((b) => <li key={b} className="flex gap-2.5 text-sm"><ListChecks size={17} className="mt-0.5 shrink-0 text-saffron-600" />{b}</li>)}</ul>
          </div>
        )}
      </div>

      {puja.recommendedProducts?.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-2xl">Recommended Samagri</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{puja.recommendedProducts.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </div>
      )}

      {pandits.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-2xl">Pandits for this Puja</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pandits.map((p) => (
              <Link key={p._id} to={`/book?puja=${puja._id}&pandit=${p._id}`} className="card flex items-center gap-4 p-4 hover:shadow-lift">
                <Img src={p.profileImage} alt={p.name} className="h-14 w-14 rounded-full" />
                <div><p className="font-semibold">{p.name}</p><p className="text-xs text-brown-500">{p.experience} yrs · {p.city}</p></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
