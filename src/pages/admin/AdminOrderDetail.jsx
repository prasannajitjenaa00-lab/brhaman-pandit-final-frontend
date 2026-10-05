import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../lib/api';
import { ErrorBox, Img, Spinner, StatusBadge, useFetch } from '../../components/ui';
import { PageHeader } from '../../components/AdminUI';
import { OrderTimeline } from '../dashboard/Orders';
import { fmtDateTime, label, money } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

const NEXT = {
  PLACED: ['CONFIRMED', 'Confirm order'],
  CONFIRMED: ['PROCESSING', 'Start processing'],
  PROCESSING: ['PACKED', 'Mark packed'],
  PACKED: ['SHIPPED', 'Mark shipped'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'Out for delivery'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'Mark delivered'],
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { meta } = useSite();
  const { data, loading, error, reload } = useFetch(`/admin/orders/${id}`);
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  const o = data?.order;
  useEffect(() => { if (o) setF({ paymentStatus: o.paymentStatus, trackingNumber: o.trackingNumber || '', adminNotes: o.adminNotes || '', status: '' }); }, [o]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  const update = async (patch, msg = 'Order updated') => {
    setBusy(true);
    try { await api.patch(`/admin/orders/${id}`, patch); toast.success(msg); reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const closed = ['DELIVERED', 'CANCELLED'].includes(o.orderStatus);
  const next = NEXT[o.orderStatus];
  const currentIdx = meta.orderStatuses.indexOf(o.orderStatus);

  return (
    <>
      <Link to="/admin/orders" className="text-sm text-maroon-600">← All orders</Link>
      <PageHeader title={`Order ${o.orderId}`} subtitle={`Placed ${fmtDateTime(o.createdAt)}`} action={<div className="flex gap-2"><StatusBadge status={o.orderStatus} /><StatusBadge status={o.paymentStatus} /></div>} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="mb-3 text-lg">Items</h2>
            <ul className="divide-y divide-cream-200">{o.items.map((it) => (
              <li key={it._id} className="flex items-center gap-3 py-3 text-sm"><Img src={it.image} alt="" className="h-12 w-12 rounded-lg" /><div className="flex-1"><p className="font-semibold">{it.name}</p><p className="text-xs text-brown-500">{it.sku} · {money(it.price)} × {it.quantity}</p></div><p className="font-bold">{money(it.subtotal)}</p></li>
            ))}</ul>
            <dl className="mt-3 space-y-1.5 border-t border-cream-200 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-brown-500">Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-brown-500">Delivery</dt><dd>{money(o.deliveryCharge)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt className="text-brown-500">Discount ({o.couponCode})</dt><dd>−{money(o.discount)}</dd></div>}
              <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd className="text-maroon-700">{money(o.total)}</dd></div>
            </dl>
          </div>
          <div className="card p-6 text-sm">
            <h2 className="mb-2 text-lg">Customer &amp; delivery</h2>
            <p className="font-semibold">{o.shipping.fullName}</p>
            <p>{o.shipping.phone} · {o.shipping.email}</p>
            <p className="text-brown-600">{o.shipping.address}, {o.shipping.city}, {o.shipping.state} {o.shipping.pincode}</p>
            <p className="mt-2 text-xs text-brown-500">Payment method: {o.paymentMethod === 'COD' ? 'Cash on Delivery / Pay Later' : o.paymentMethod} · Stock deducted: {o.stockDeducted ? 'Yes' : 'No'}</p>
          </div>
          <div className="card p-6"><h2 className="mb-4 text-lg">Progress</h2><OrderTimeline order={o} /></div>
        </div>

        <div className="card h-fit space-y-4 p-6">
          <h2 className="text-lg">Manage order</h2>
          {!closed && (
            <div className="flex flex-wrap gap-2">
              {next && <button className="btn-primary btn-sm" disabled={busy} onClick={() => update({ orderStatus: next[0], trackingNumber: f.trackingNumber }, `${label(next[0])} — customer notified`)}>{next[1]}</button>}
              <button className="btn-danger btn-sm" disabled={busy} onClick={() => window.confirm('Cancel this order?') && update({ orderStatus: 'CANCELLED' }, 'Order cancelled')}>Cancel order</button>
            </div>
          )}
          {!closed && (
            <div>
              <label className="label">Jump to status</label>
              <div className="flex gap-2">
                <select className="input" value={f.status || ''} onChange={(e) => setF({ ...f, status: e.target.value })}>
                  <option value="">Select…</option>
                  {meta.orderStatuses.filter((s, i) => i > currentIdx && s !== 'CANCELLED').map((s) => <option key={s} value={s}>{label(s)}</option>)}
                </select>
                <button className="btn-outline btn-sm shrink-0" disabled={busy || !f.status} onClick={() => update({ orderStatus: f.status, trackingNumber: f.trackingNumber })}>Apply</button>
              </div>
            </div>
          )}
          <div><label className="label">Tracking number / courier note</label><input className="input" value={f.trackingNumber || ''} onChange={(e) => setF({ ...f, trackingNumber: e.target.value })} /></div>
          <div><label className="label">Payment status</label><select className="input" value={f.paymentStatus || ''} onChange={(e) => setF({ ...f, paymentStatus: e.target.value })}>{meta.paymentStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
          <div><label className="label">Admin notes (internal)</label><textarea className="input min-h-20" value={f.adminNotes || ''} onChange={(e) => setF({ ...f, adminNotes: e.target.value })} /></div>
          <button className="btn-primary" disabled={busy} onClick={() => update({ paymentStatus: f.paymentStatus, trackingNumber: f.trackingNumber, adminNotes: f.adminNotes }, 'Saved')}>Save details</button>
          <p className="text-xs text-brown-500">Stock is deducted automatically when the order is first confirmed, and restored if it is cancelled afterwards.</p>
        </div>
      </div>
    </>
  );
}
