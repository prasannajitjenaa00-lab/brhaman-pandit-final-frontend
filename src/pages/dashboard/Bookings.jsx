import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../lib/api';
import { Empty, ErrorBox, Modal, Pagination, Spinner, StarInput, StatusBadge, useFetch } from '../../components/ui';
import { fmtDate, money } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

export function MyBookings() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useFetch('/me/bookings', { page });
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  return (
    <div>
      <h1 className="mb-5 text-2xl">My Bookings</h1>
      {data.items.length === 0 ? <Empty title="No bookings yet" text="Book a Pandit for your next Puja." action={<Link to="/pandits" className="btn-primary">Book a Pandit</Link>} /> : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-cream-200"><tr>{['Booking ID', 'Puja', 'Pandit', 'Date & Time', 'Status', 'Amount', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-cream-200">
                {data.items.map((b) => (
                  <tr key={b._id}>
                    <td className="td font-semibold">{b.bookingId}</td>
                    <td className="td">{b.puja?.name}</td>
                    <td className="td">{b.pandit?.name || <span className="text-brown-400">To be assigned</span>}</td>
                    <td className="td whitespace-nowrap">{fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}<br /><span className="text-xs text-brown-500">{b.time}</span></td>
                    <td className="td"><StatusBadge status={b.bookingStatus} /></td>
                    <td className="td">{money(b.amount)}</td>
                    <td className="td"><Link to={`/dashboard/bookings/${b._id}`} className="btn-outline btn-sm">View Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export function BookingDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(`/me/bookings/${id}`);
  const { meta } = useSite();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ reason: '', date: '', time: '', rating: 5, comment: '' });
  const [busy, setBusy] = useState(false);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  const b = data.booking;
  const open = ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(b.bookingStatus);

  const act = async (fn) => {
    setBusy(true);
    try {
      const msg = await fn();
      toast.success(msg || 'Done');
      setModal(null);
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const rows = [
    ['Puja', b.puja?.name], ['Pandit', b.pandit?.name || 'To be assigned'], ['Date', fmtDate(b.date)], ['Time', b.time],
    ['Address', `${b.address}, ${b.city}, ${b.state} ${b.pincode}`], ['Contact', `${b.customerName} · ${b.phone} · ${b.email}`],
    ['Requirements', b.additionalRequirements || '—'], ['Amount', money(b.amount)],
  ];

  return (
    <div className="space-y-5">
      <Link to="/dashboard/bookings" className="text-sm text-maroon-600">← All bookings</Link>
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs uppercase tracking-wide text-brown-400">Booking ID</p><h1 className="text-2xl">{b.bookingId}</h1></div>
          <div className="flex gap-2"><StatusBadge status={b.bookingStatus} /><StatusBadge status={b.paymentStatus} /></div>
        </div>
        <dl className="mt-5 divide-y divide-cream-200 text-sm">
          {rows.map(([k, v]) => <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-6"><dt className="text-brown-500">{k}</dt><dd className="font-medium sm:text-right">{v}</dd></div>)}
        </dl>
        {b.cancellationRequested && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Cancellation requested — awaiting confirmation from our team.</p>}
        {b.rescheduleRequest?.requested && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Reschedule requested for {fmtDate(b.rescheduleRequest.date)} at {b.rescheduleRequest.time} — awaiting confirmation.</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {open && !b.cancellationRequested && <button className="btn-outline" onClick={() => setModal('cancel')}>Request Cancellation</button>}
          {open && !b.rescheduleRequest?.requested && <button className="btn-outline" onClick={() => setModal('reschedule')}>Request Reschedule</button>}
          {b.bookingStatus === 'COMPLETED' && !b.reviewed && <button className="btn-gold" onClick={() => setModal('review')}>Write a Review</button>}
          {b.reviewed && <span className="badge bg-green-100 text-green-800">Reviewed — thank you!</span>}
        </div>
      </div>

      <Modal open={modal === 'cancel'} onClose={() => setModal(null)} title="Request cancellation">
        <label className="label">Reason (optional)</label>
        <textarea className="input min-h-24" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <p className="mt-2 text-xs text-brown-500">Our team will review and confirm your cancellation.</p>
        <button className="btn-danger mt-4 w-full" disabled={busy} onClick={() => act(async () => (await api.post(`/me/bookings/${id}/cancel-request`, { reason: form.reason })).data.message)}>Send Request</button>
      </Modal>
      <Modal open={modal === 'reschedule'} onClose={() => setModal(null)} title="Request reschedule">
        <div className="space-y-3">
          <div><label className="label">New date</label><input type="date" className="input" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="label">New time</label><select className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}><option value="">Select a time</option>{meta.timeSlots.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Reason (optional)</label><textarea className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
        </div>
        <button className="btn-primary mt-4 w-full" disabled={busy || !form.date || !form.time} onClick={() => act(async () => (await api.post(`/me/bookings/${id}/reschedule-request`, { date: form.date, time: form.time, reason: form.reason })).data.message)}>Send Request</button>
      </Modal>
      <Modal open={modal === 'review'} onClose={() => setModal(null)} title="Review your Puja">
        <StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
        <textarea className="input mt-3 min-h-24" placeholder="Share your experience…" maxLength={1500} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
        <button className="btn-primary mt-4 w-full" disabled={busy} onClick={() => act(async () => { await api.post('/me/reviews', { bookingId: id, rating: form.rating, comment: form.comment }); return 'Thanks for your review!'; })}>Submit Review</button>
      </Modal>
    </div>
  );
}
