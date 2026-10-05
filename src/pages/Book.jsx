import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiCheckCircle as CheckCircle2, FiChevronLeft as ChevronLeft, FiChevronRight as ChevronRight } from 'react-icons/fi';
import api, { errMsg } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Field, Img, Spinner, useFetch } from '../components/ui';
import { EMAIL_RULE, PHONE_RULE, PIN_RULE, fmtDate, money } from '../lib/format';
import { useSite } from '../context/SiteContext';

const STEPS = ['Puja', 'Date', 'Time', 'Location', 'Requirements', 'Summary'];
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Book() {
  const [sp] = useSearchParams();
  const { meta } = useSite();
  const { user } = useAuth();
  const pujas = useFetch('/pujas');
  const [step, setStep] = useState(0);
  const [pujaId, setPujaId] = useState(sp.get('puja') || '');
  const [panditId, setPanditId] = useState(sp.get('pandit') || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [extra, setExtra] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const form = useForm({ defaultValues: { customerName: user?.name || '', phone: user?.phone || '', email: user?.email || '', address: '', city: '', state: '', pincode: '' } });

  const pandits = useFetch('/pandits', { puja: pujaId || undefined, limit: 50 });
  const preselected = useFetch(sp.get('pandit') ? `/pandits/${sp.get('pandit')}` : null);

  // Arriving from a Pandit profile: infer a puja the Pandit performs
  useEffect(() => {
    const p = preselected.data?.pandit;
    if (p && !pujaId && p.services?.length) setPujaId(p.services[0]._id);
  }, [preselected.data, pujaId]);

  const puja = pujas.data?.items.find((p) => p._id === pujaId);
  const pandit = pandits.data?.items.find((p) => p._id === panditId) || (preselected.data?.pandit?._id === panditId ? preselected.data.pandit : null);
  const slots = pandit?.availability?.timeSlots?.length ? pandit.availability.timeSlots : meta.timeSlots;
  const amount = pandit?.priceFrom || puja?.priceFrom || 0;
  const values = form.watch();

  // Pandits only list for the chosen puja, so drop a stale selection
  useEffect(() => {
    if (panditId && pandits.data && !pandits.data.items.some((p) => p._id === panditId) && preselected.data?.pandit?._id !== panditId) setPanditId('');
  }, [pandits.data, panditId, preselected.data]);

  const canNext = useMemo(() => [!!pujaId, !!date, !!time, true, true, true][step], [step, pujaId, date, time]);

  const next = async () => {
    if (step === 3 && !(await form.trigger())) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await api.post('/me/bookings', { puja: pujaId, pandit: panditId || undefined, date, time, additionalRequirements: extra, ...form.getValues() });
      setDone(r.data.booking);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (pujas.loading) return <Spinner />;

  if (done)
    return (
      <div className="container-x max-w-xl py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="mt-4 text-3xl">Booking request submitted</h1>
        <p className="mt-2 text-brown-600">Your booking request has been submitted successfully.</p>
        <div className="card mx-auto mt-6 p-6">
          <p className="text-xs uppercase tracking-wide text-brown-400">Booking ID</p>
          <p className="font-serif text-3xl font-bold text-maroon-700">{done.bookingId}</p>
          <p className="mt-3 text-sm text-brown-500">We’ll confirm your booking shortly and email you the details.</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to={`/dashboard/bookings/${done._id}`} className="btn-primary">View Booking</Link>
          <Link to="/shop" className="btn-outline">Shop Puja Samagri</Link>
        </div>
      </div>
    );

  const err = form.formState.errors;
  return (
    <div className="container-x max-w-3xl py-10">
      <h1 className="mb-6 text-center text-3xl">Book a Pandit</h1>
      <ol className="mb-8 flex items-center justify-between gap-1 text-xs" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col items-center gap-1">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${i <= step ? 'bg-maroon-700 text-white' : 'bg-cream-200 text-brown-500'}`}>{i + 1}</span>
            <span className={`hidden sm:block ${i === step ? 'font-semibold text-maroon-700' : 'text-brown-400'}`}>{s}</span>
          </li>
        ))}
      </ol>

      <div className="card p-6 sm:p-8">
        {step === 0 && (
          <div>
            <h2 className="mb-4 text-xl">Select Puja</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pujas.data?.items.map((p) => (
                <button key={p._id} type="button" onClick={() => setPujaId(p._id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${pujaId === p._id ? 'border-maroon-600 bg-maroon-50 ring-2 ring-maroon-600/20' : 'border-cream-300 hover:border-gold-400'}`}>
                  <Img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-lg" />
                  <span><span className="block text-sm font-semibold">{p.name}</span><span className="text-xs text-brown-500">from {money(p.priceFrom)}</span></span>
                </button>
              ))}
            </div>
            {pujaId && (
              <div className="mt-6">
                <label className="label">Pandit (optional)</label>
                <select className="input" value={panditId} onChange={(e) => setPanditId(e.target.value)}>
                  <option value="">Let Brahmam Pandit assign the best Pandit</option>
                  {pandits.data?.items.filter((p) => p.availability?.isAvailable).map((p) => <option key={p._id} value={p._id}>{p.name} — {p.city} · {p.experience} yrs · from {money(p.priceFrom)}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-4 text-xl">Select Date</h2>
            <input type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-xs" />
            <p className="mt-2 text-xs text-brown-500">Choose a date at least a day ahead where possible so we can confirm a Pandit.</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-4 text-xl">Select Time</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {slots.map((t) => (
                <button key={t} type="button" onClick={() => setTime(t)} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${time === t ? 'border-maroon-600 bg-maroon-700 text-white' : 'border-cream-300 hover:border-gold-400'}`}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-4 text-xl">Enter Location</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" error={err.customerName}><input className="input" {...form.register('customerName', { required: 'Name is required' })} /></Field>
              <Field label="Phone" error={err.phone}><input className="input" inputMode="tel" {...form.register('phone', PHONE_RULE)} /></Field>
              <Field label="Email" error={err.email} className="sm:col-span-2"><input className="input" type="email" {...form.register('email', EMAIL_RULE)} /></Field>
              <Field label="Address" error={err.address} className="sm:col-span-2"><input className="input" {...form.register('address', { required: 'Address is required' })} /></Field>
              <Field label="City" error={err.city}><input className="input" {...form.register('city', { required: 'City is required' })} /></Field>
              <Field label="State" error={err.state}><input className="input" {...form.register('state', { required: 'State is required' })} /></Field>
              <Field label="Pincode" error={err.pincode}><input className="input" inputMode="numeric" maxLength={6} {...form.register('pincode', PIN_RULE)} /></Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="mb-4 text-xl">Additional Requirements</h2>
            <textarea className="input min-h-32" maxLength={1000} placeholder="Anything the Pandit should know — preferred language, special rituals, number of guests…" value={extra} onChange={(e) => setExtra(e.target.value)} />
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="mb-4 text-xl">Booking Summary</h2>
            <dl className="divide-y divide-cream-200 text-sm">
              {[['Puja', puja?.name], ['Pandit', pandit?.name || 'To be assigned by our team'], ['Date', fmtDate(date)], ['Time', time], ['Location', `${values.address}, ${values.city}, ${values.state} ${values.pincode}`], ['Contact', `${values.customerName} · ${values.phone}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-brown-500">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
              ))}
              {extra && <div className="flex justify-between gap-4 py-3"><dt className="text-brown-500">Requirements</dt><dd className="max-w-xs text-right">{extra}</dd></div>}
              <div className="flex justify-between py-3 text-base"><dt className="font-semibold">Estimated amount</dt><dd className="font-bold text-maroon-700">{money(amount)}</dd></div>
            </dl>
            <p className="mt-2 rounded-xl bg-saffron-50 p-3 text-xs text-brown-600">No payment is required now. Our team will confirm your booking and the final amount; payment is handled directly with us.</p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ChevronLeft size={16} /> Back</button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" disabled={!canNext} onClick={next}>Continue <ChevronRight size={16} /></button>
          ) : (
            <button className="btn-gold" disabled={submitting} onClick={submit}>{submitting ? 'Submitting…' : 'Submit Booking Request'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
