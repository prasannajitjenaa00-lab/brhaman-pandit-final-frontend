import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiCheckCircle as CheckCircle2 } from 'react-icons/fi';
import { FaTicketAlt as Ticket } from 'react-icons/fa';
import api, { errMsg } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Empty, Field, useFetch } from '../components/ui';
import { EMAIL_RULE, PHONE_RULE, PIN_RULE, money } from '../lib/format';
import { useSite } from '../context/SiteContext';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { deliveryFor } = useSite();
  const delivery = deliveryFor(subtotal);
  const addresses = useFetch('/me/addresses');
  const [coupon, setCoupon] = useState(null);
  const [code, setCode] = useState('');
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { fullName: user?.name || '', phone: user?.phone || '', email: user?.email || '', address: '', city: '', state: '', pincode: '' },
  });

  useEffect(() => {
    const def = addresses.data?.items.find((a) => a.isDefault);
    if (def) reset({ fullName: def.fullName, phone: def.phone, email: user.email, address: def.address, city: def.city, state: def.state, pincode: def.pincode });
  }, [addresses.data, reset, user.email]);

  // a coupon is validated against the subtotal, so re-check if the cart changes
  useEffect(() => {
    setCoupon(null);
  }, [subtotal]);

  const applyCoupon = async () => {
    try {
      const r = await api.post('/me/coupons/validate', { code, subtotal });
      setCoupon(r.data);
      toast.success(`Coupon applied: −${money(r.data.discount)}`);
    } catch (e) {
      setCoupon(null);
      toast.error(errMsg(e));
    }
  };

  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal - discount + delivery);

  const place = async (shipping) => {
    setPlacing(true);
    try {
      const r = await api.post('/me/orders', { items: items.map((i) => ({ product: i.id, quantity: i.quantity })), shipping, couponCode: coupon?.code });
      clear();
      setDone(r.data.order);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setPlacing(false);
    }
  };

  if (done)
    return (
      <div className="container-x max-w-xl py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="mt-4 text-3xl">Order placed successfully</h1>
        <p className="mt-2 text-brown-600">Thank you! Pay when your order is delivered.</p>
        <div className="card mx-auto mt-6 p-6"><p className="text-xs uppercase tracking-wide text-brown-400">Order ID</p><p className="font-serif text-3xl font-bold text-maroon-700">{done.orderId}</p><p className="mt-2 text-sm text-brown-500">Total payable: {money(done.total)}</p></div>
        <div className="mt-6 flex justify-center gap-3"><Link to={`/dashboard/orders/${done._id}`} className="btn-primary">Track Order</Link><Link to="/shop" className="btn-outline">Continue Shopping</Link></div>
      </div>
    );

  if (!items.length) return <div className="container-x py-16"><Empty title="Your cart is empty" action={<Link to="/shop" className="btn-primary">Go to Shop</Link>} /></div>;

  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-3xl">Checkout</h1>
      <form onSubmit={handleSubmit(place)} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 text-xl">Delivery Details</h2>
            {addresses.data?.items.length > 0 && (
              <div className="mb-4">
                <label className="label">Use a saved address</label>
                <select className="input" defaultValue="" onChange={(e) => { const a = addresses.data.items.find((x) => x._id === e.target.value); if (a) reset({ fullName: a.fullName, phone: a.phone, email: user.email, address: a.address, city: a.city, state: a.state, pincode: a.pincode }); }}>
                  <option value="">Select…</option>
                  {addresses.data.items.map((a) => <option key={a._id} value={a._id}>{a.label} — {a.address}, {a.city}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" error={errors.fullName}><input className="input" {...register('fullName', { required: 'Name is required' })} /></Field>
              <Field label="Phone" error={errors.phone}><input className="input" inputMode="tel" {...register('phone', PHONE_RULE)} /></Field>
              <Field label="Email" error={errors.email} className="sm:col-span-2"><input className="input" type="email" {...register('email', EMAIL_RULE)} /></Field>
              <Field label="Address" error={errors.address} className="sm:col-span-2"><input className="input" {...register('address', { required: 'Address is required' })} /></Field>
              <Field label="City" error={errors.city}><input className="input" {...register('city', { required: 'City is required' })} /></Field>
              <Field label="State" error={errors.state}><input className="input" {...register('state', { required: 'State is required' })} /></Field>
              <Field label="Pincode" error={errors.pincode}><input className="input" inputMode="numeric" maxLength={6} {...register('pincode', PIN_RULE)} /></Field>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="mb-3 text-xl">Payment Method</h2>
            <label className="flex items-center gap-3 rounded-xl border border-maroon-600 bg-maroon-50 p-4">
              <input type="radio" checked readOnly className="accent-maroon-600" />
              <span><span className="block font-semibold">Cash on Delivery / Pay Later</span><span className="text-xs text-brown-500">Pay when your order arrives. No online payment needed.</span></span>
            </label>
          </div>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xl">Order Summary</h2>
          <ul className="mb-4 space-y-2 text-sm">{items.map((i) => <li key={i.id} className="flex justify-between gap-3"><span className="text-brown-600">{i.product.name} × {i.quantity}</span><span>{money(i.unit * i.quantity)}</span></li>)}</ul>
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1"><Ticket size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" /><input className="input pl-9 uppercase" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} /></div>
            <button type="button" className="btn-outline" disabled={!code.trim()} onClick={applyCoupon}>Apply</button>
          </div>
          <dl className="space-y-2.5 border-t border-cream-200 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-brown-500">Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-brown-500">Delivery Charge</dt><dd>{delivery ? money(delivery) : 'Free'}</dd></div>
            <div className="flex justify-between"><dt className="text-brown-500">Discount {coupon && `(${coupon.code})`}</dt><dd className="text-emerald-700">{discount ? `−${money(discount)}` : '—'}</dd></div>
            <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold"><dt>Total</dt><dd className="text-maroon-700">{money(total)}</dd></div>
          </dl>
          <button className="btn-gold mt-5 w-full py-3" disabled={placing}>{placing ? 'Placing order…' : 'Place Order'}</button>
        </aside>
      </form>
    </div>
  );
}
