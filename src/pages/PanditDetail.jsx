import { Link, useParams } from 'react-router-dom';
import { FiAward as Award, FiCalendar as CalendarDays, FiMapPin as MapPin } from 'react-icons/fi';
import { MdVerified as BadgeCheck, MdTranslate as Languages } from 'react-icons/md';
import { ErrorBox, Img, Spinner, Stars, useFetch } from '../components/ui';
import { fmtDate, money } from '../lib/format';

export default function PanditDetail() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/pandits/${id}`);
  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-16"><ErrorBox message={error} /></div>;
  const { pandit: p, reviews } = data;
  const available = p.availability?.isAvailable;

  return (
    <div className="container-x py-10">
      <div className="card grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-[220px_1fr]">
        <Img src={p.profileImage} alt={p.name} className="mx-auto h-48 w-48 rounded-full border-4 border-gold-400 shadow-soft" />
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-3xl font-semibold">
            {p.name} {p.isVerified && <span className="badge bg-emerald-100 text-emerald-800"><BadgeCheck size={13} className="mr-1" />Verified</span>}
          </h1>
          <div className="mt-2"><Stars value={p.rating} count={p.totalReviews} size={16} /></div>
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-brown-600 sm:grid-cols-2">
            <p className="flex items-center gap-2"><Award size={16} className="text-saffron-600" /> {p.experience} years experience</p>
            <p className="flex items-center gap-2"><MapPin size={16} className="text-saffron-600" /> {p.location || `${p.city}, ${p.state}`}</p>
            <p className="flex items-center gap-2"><Languages size={16} className="text-saffron-600" /> {p.languages?.join(', ')}</p>
            <p className="flex items-center gap-2"><CalendarDays size={16} className="text-saffron-600" /> {p.completedPujas || 0} Pujas completed</p>
          </div>
          <p className="mt-4 text-brown-600">{p.bio}</p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <div><p className="text-xs uppercase tracking-wide text-brown-400">Starting from</p><p className="text-3xl font-bold text-maroon-700">{money(p.priceFrom)}</p></div>
            {available ? <Link to={`/book?pandit=${p._id}`} className="btn-primary px-8 py-3 text-base">Book This Pandit</Link> : <span className="badge bg-slate-200 px-4 py-2 text-slate-700">Currently unavailable</span>}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-xl">Puja Services &amp; Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {p.services?.map((s) => <Link key={s._id} to={`/pujas/${s.slug}`} className="badge bg-cream-200 px-3 py-1.5 text-maroon-700 hover:bg-saffron-100">{s.name}</Link>)}
            {p.specializations?.filter((s) => !p.services?.some((x) => x.name === s)).map((s) => <span key={s} className="badge bg-cream-200 px-3 py-1.5 text-maroon-700">{s}</span>)}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-xl">Availability</h2>
          <p className="text-sm text-brown-600"><strong>Days:</strong> {p.availability?.days?.join(', ')}</p>
          <p className="mt-2 text-sm text-brown-600"><strong>Time slots:</strong> {p.availability?.timeSlots?.join(' · ')}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-5 text-2xl">Reviews</h2>
        {reviews.length === 0 ? <p className="text-brown-500">No reviews yet.</p> : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center justify-between"><p className="font-semibold">{r.user?.name || 'Devotee'}</p><Stars value={r.rating} /></div>
                {r.comment && <p className="mt-2 text-sm text-brown-600">{r.comment}</p>}
                <p className="mt-2 text-xs text-brown-400">{fmtDate(r.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
