import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../lib/api';
import { ErrorBox, Spinner, StatusBadge, useFetch } from '../../components/ui';
import { PageHeader } from '../../components/AdminUI';
import { fmtDate, fmtDateTime, money, toInputDate } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

export default function AdminBookingDetail() {
  const { id } = useParams();
  const { meta } = useSite();
  const { data, loading, error, reload } = useFetch(`/admin/bookings/${id}`);
  const pandits = useFetch('/admin/pandits', { limit: 100, status: 'active' });
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);

  const b = data?.booking;
  useEffect(() => {
    if (b) setF({ pandit: b.pandit?._id || '', date: toInputDate(b.date), time: b.time, paymentStatus: b.paymentStatus, adminNotes: b.adminNotes || '', amount: b.amount });
  }, [b]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  const update = async (patch, msg = 'Booking updated') => {
    setBusy(true);
    try {
      await api.patch(`/admin/bookings/${id}`, patch);
      toast.success(msg);
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const confirmThen = (text, patch, msg) => window.confirm(text) && update(patch, msg);
  const closed = ['COMPLETED', 'CANCELLED'].includes(b.bookingStatus);
  const slotChanged = f.date !== toInputDate(b.date) || f.time !== b.time;

  return (
    <>
      <Link to="/admin/bookings" className="text-sm text-maroon-600">← All bookings</Link>
      <PageHeader title={b.bookingId} subtitle={`Created ${fmtDateTime(b.createdAt)}`} action={<div className="flex gap-2"><StatusBadge status={b.bookingStatus} /><StatusBadge status={b.paymentStatus} /></div>} />

      {(b.cancellationRequested || b.rescheduleRequest?.requested) && (
        <div className="card mb-5 space-y-2 border-amber-300 bg-amber-50 p-5 text-sm">
          {b.cancellationRequested && <div className="flex flex-wrap items-center justify-between gap-3"><p><strong>Customer requested cancellation.</strong> {b.cancellationReason && `Reason: ${b.cancellationReason}`}</p><div className="flex gap-2"><button className="btn-danger btn-sm" disabled={busy} onClick={() => confirmThen('Cancel this booking and notify the customer?', { bookingStatus: 'CANCELLED' }, 'Booking cancelled')}>Approve &amp; cancel</button><button className="btn-outline btn-sm" disabled={busy} onClick={() => update({ dismissRequests: true }, 'Request dismissed')}>Dismiss</button></div></div>}
          {b.rescheduleRequest?.requested && <div className="flex flex-wrap items-center justify-between gap-3"><p><strong>Customer requested reschedule</strong> to {fmtDate(b.rescheduleRequest.date)} at {b.rescheduleRequest.time}. {b.rescheduleRequest.reason}</p><div className="flex gap-2"><button className="btn-primary btn-sm" disabled={busy} onClick={() => setF({ ...f, date: toInputDate(b.rescheduleRequest.date), time: b.rescheduleRequest.time })}>Load into form</button><button className="btn-outline btn-sm" disabled={busy} onClick={() => update({ dismissRequests: true }, 'Request dismissed')}>Dismiss</button></div></div>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 text-lg">Booking details</h2>
          <dl className="divide-y divide-cream-200 text-sm">
            {[['Puja', b.puja?.name], ['Pandit', b.pandit?.name || 'Unassigned'], ['Date', fmtDate(b.date)], ['Time', b.time], ['Customer', b.customerName], ['Phone', b.phone], ['Email', b.email], ['Address', `${b.address}, ${b.city}, ${b.state} ${b.pincode}`], ['Requirements', b.additionalRequirements || '—'], ['Amount', money(b.amount)], ['Account', b.user ? `${b.user.name} (${b.user.email})` : '—']].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-brown-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
            ))}
          </dl>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="text-lg">Manage booking</h2>
          <div className="flex flex-wrap gap-2">
            {b.bookingStatus === 'PENDING' && <button className="btn-primary btn-sm" disabled={busy} onClick={() => update({ bookingStatus: 'CONFIRMED', pandit: f.pandit || undefined }, 'Booking confirmed — email sent')}>Confirm booking</button>}
            {b.bookingStatus === 'RESCHEDULED' && <button className="btn-primary btn-sm" disabled={busy} onClick={() => update({ bookingStatus: 'CONFIRMED' }, 'Booking confirmed — email sent')}>Confirm booking</button>}
            {['CONFIRMED', 'RESCHEDULED'].includes(b.bookingStatus) && <button className="btn-gold btn-sm" disabled={busy} onClick={() => confirmThen('Mark this booking completed?', { bookingStatus: 'COMPLETED' }, 'Marked completed')}>Mark completed</button>}
            {!closed && <button className="btn-danger btn-sm" disabled={busy} onClick={() => confirmThen('Cancel this booking and notify the customer?', { bookingStatus: 'CANCELLED' }, 'Booking cancelled')}>Cancel booking</button>}
          </div>

          <div>
            <label className="label">Assign / change Pandit</label>
            <div className="flex gap-2">
              <select className="input" disabled={closed} value={f.pandit || ''} onChange={(e) => setF({ ...f, pandit: e.target.value })}>
                <option value="">Unassigned</option>
                {pandits.data?.items.map((p) => <option key={p._id} value={p._id}>{p.name} — {p.city}</option>)}
              </select>
              <button className="btn-outline btn-sm shrink-0" disabled={busy || closed || f.pandit === (b.pandit?._id || '')} onClick={() => update({ pandit: f.pandit }, 'Pandit updated')}>Save</button>
            </div>
          </div>

          <div>
            <label className="label">Reschedule</label>
            <div className="flex flex-wrap gap-2">
              <input type="date" className="input w-auto" disabled={closed} value={f.date || ''} onChange={(e) => setF({ ...f, date: e.target.value })} />
              <select className="input w-auto" disabled={closed} value={f.time || ''} onChange={(e) => setF({ ...f, time: e.target.value })}>{[...new Set([b.time, ...meta.timeSlots])].map((t) => <option key={t}>{t}</option>)}</select>
              <button className="btn-outline btn-sm" disabled={busy || closed || !slotChanged} onClick={() => update({ date: f.date, time: f.time }, 'Rescheduled — email sent')}>Reschedule</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className="label">Payment status</label><select className="input" value={f.paymentStatus || ''} onChange={(e) => setF({ ...f, paymentStatus: e.target.value })}>{meta.paymentStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
            <div><label className="label">Amount (₹)</label><input type="number" min="0" className="input" value={f.amount ?? ''} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
          </div>
          <div><label className="label">Admin notes (internal)</label><textarea className="input min-h-20" value={f.adminNotes || ''} onChange={(e) => setF({ ...f, adminNotes: e.target.value })} /></div>
          <button className="btn-primary" disabled={busy} onClick={() => update({ paymentStatus: f.paymentStatus, adminNotes: f.adminNotes, amount: f.amount }, 'Saved')}>Save payment &amp; notes</button>
        </div>
      </div>
    </>
  );
}
