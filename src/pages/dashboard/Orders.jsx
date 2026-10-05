import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck as Check, FiXCircle as XCircle } from 'react-icons/fi';
import api, { errMsg } from '../../lib/api';
import { Empty, ErrorBox, Img, Modal, Pagination, Spinner, StarInput, StatusBadge, useFetch } from '../../components/ui';
import { fmtDateTime, label, money } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

export function MyOrders() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useFetch('/me/orders', { page });
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  return (
    <div>
      <h1 className="mb-5 text-2xl">My Orders</h1>
      {data.items.length === 0 ? <Empty title="No orders yet" action={<Link to="/shop" className="btn-primary">Shop Puja Samagri</Link>} /> : (
        <>
          <div className="space-y-3">
            {data.items.map((o) => (
              <Link key={o._id} to={`/dashboard/orders/${o._id}`} className="card flex flex-wrap items-center justify-between gap-3 p-5 transition hover:shadow-lift">
                <div><p className="font-semibold">Order #{o.orderId}</p><p className="text-xs text-brown-500">{fmtDateTime(o.createdAt)} · {o.items.length} item(s)</p></div>
                <StatusBadge status={o.orderStatus} />
                <p className="font-bold text-maroon-700">{money(o.total)}</p>
              </Link>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export function OrderTimeline({ order }) {
  const { meta } = useSite();
  const FLOW = meta.orderStatuses.filter((s) => s !== 'CANCELLED'); // cancellation is shown separately
  if (order.orderStatus === 'CANCELLED')
    return <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700"><XCircle /> This order was cancelled.</div>;
  const idx = FLOW.indexOf(order.orderStatus);
  const at = Object.fromEntries((order.statusHistory || []).map((h) => [h.status, h.at]));
  return (
    <ol className="relative space-y-5 border-l-2 border-cream-300 pl-7" aria-label="Order tracking">
      {FLOW.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} className="relative">
            <span className={`absolute -left-[39px] flex h-6 w-6 items-center justify-center rounded-full border-2 ${done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-cream-300 bg-white'}`}>{done && <Check size={14} />}</span>
            <p className={`text-sm font-semibold ${done ? 'text-brown-800' : 'text-brown-400'}`}>{label(s)}{i === idx && <span className="ml-2 badge bg-saffron-100 text-saffron-600">Current</span>}</p>
            {at[s] && <p className="text-xs text-brown-500">{fmtDateTime(at[s])}</p>}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(`/me/orders/${id}`);
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [busy, setBusy] = useState(false);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  const { order: o, reviewedProducts } = data;

  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/me/reviews', { orderId: o._id, productId: target.product._id || target.product, rating: form.rating, comment: form.comment });
      toast.success('Thanks for your review!');
      setTarget(null);
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link to="/dashboard/orders" className="text-sm text-maroon-600">← All orders</Link>
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs uppercase tracking-wide text-brown-400">Order</p><h1 className="text-2xl">#{o.orderId}</h1><p className="text-xs text-brown-500">Placed {fmtDateTime(o.createdAt)}</p></div>
          <div className="flex gap-2"><StatusBadge status={o.orderStatus} /><StatusBadge status={o.paymentStatus} /></div>
        </div>
        {o.trackingNumber && <p className="mt-3 text-sm"><strong>Tracking:</strong> {o.trackingNumber}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-6"><h2 className="mb-5 text-lg">Track Order</h2><OrderTimeline order={o} /></div>
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="mb-3 text-lg">Items</h2>
            <ul className="divide-y divide-cream-200">
              {o.items.map((it) => (
                <li key={it._id} className="flex items-center gap-3 py-3">
                  <Img src={it.image} alt="" className="h-14 w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{it.name}</p><p className="text-xs text-brown-500">{money(it.price)} × {it.quantity}</p>
                    {o.orderStatus === 'DELIVERED' && !reviewedProducts.includes(String(it.product?._id || it.product)) && <button className="mt-1 text-xs font-semibold text-maroon-600" onClick={() => { setForm({ rating: 5, comment: '' }); setTarget(it); }}>Write a review</button>}
                  </div>
                  <p className="text-sm font-bold">{money(it.subtotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-cream-200 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-brown-500">Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-brown-500">Delivery</dt><dd>{o.deliveryCharge ? money(o.deliveryCharge) : 'Free'}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt className="text-brown-500">Discount ({o.couponCode})</dt><dd className="text-emerald-700">−{money(o.discount)}</dd></div>}
              <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd className="text-maroon-700">{money(o.total)}</dd></div>
            </dl>
          </div>
          <div className="card p-6 text-sm"><h2 className="mb-2 text-lg">Delivery Address</h2><p className="font-semibold">{o.shipping.fullName} · {o.shipping.phone}</p><p className="text-brown-600">{o.shipping.address}, {o.shipping.city}, {o.shipping.state} {o.shipping.pincode}</p><p className="mt-2 text-xs text-brown-500">Payment: Cash on Delivery / Pay Later</p></div>
        </div>
      </div>

      <Modal open={!!target} onClose={() => setTarget(null)} title={`Review ${target?.name || ''}`}>
        <StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
        <textarea className="input mt-3 min-h-24" maxLength={1500} placeholder="Share your experience…" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
        <button className="btn-primary mt-4 w-full" disabled={busy} onClick={submit}>Submit Review</button>
      </Modal>
    </div>
  );
}
