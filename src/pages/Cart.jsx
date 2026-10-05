import { Link, useNavigate } from 'react-router-dom';
import { FiMinus as Minus, FiPlus as Plus, FiShoppingBag as ShoppingBag, FiTrash2 as Trash2 } from 'react-icons/fi';
import { Empty, Img } from '../components/ui';
import { useSite } from '../context/SiteContext';
import { useCart } from '../context/CartContext';
import { money } from '../lib/format';

export default function Cart() {
  const { items, subtotal, setQty, remove } = useCart();
  const { deliveryFor } = useSite();
  const delivery = deliveryFor(subtotal);
  const navigate = useNavigate();

  if (!items.length)
    return <div className="container-x py-16"><Empty title="Your cart is empty" text="Add some Puja Samagri to get started." action={<Link to="/shop" className="btn-primary">Continue Shopping</Link>} /></div>;

  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-3xl">Your Cart</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map(({ product: p, quantity, unit }) => (
            <div key={p._id} className="card flex gap-4 p-4">
              <Link to={`/shop/${p.slug}`}><Img src={p.images?.[0]} alt={p.name} icon={ShoppingBag} className="h-24 w-24 shrink-0 rounded-xl" /></Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <Link to={`/shop/${p.slug}`} className="font-semibold hover:text-maroon-600">{p.name}</Link>
                  <button onClick={() => remove(p._id)} aria-label={`Remove ${p.name}`} className="text-brown-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center rounded-full border border-cream-300">
                    <button className="p-2" aria-label="Decrease" onClick={() => setQty(p._id, quantity - 1)}><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button className="p-2" aria-label="Increase" onClick={() => setQty(p._id, quantity + 1)} disabled={quantity >= p.stock}><Plus size={14} /></button>
                  </div>
                  <p className="text-sm text-brown-500">{money(unit)} each</p>
                  <p className="font-bold text-maroon-700">{money(unit * quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xl">Order Summary</h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-brown-500">Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-brown-500">Delivery Charge</dt><dd>{delivery ? money(delivery) : 'Free'}</dd></div>
            <div className="flex justify-between"><dt className="text-brown-500">Discount</dt><dd className="text-brown-400">Apply coupon at checkout</dd></div>
            <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold"><dt>Total</dt><dd className="text-maroon-700">{money(subtotal + delivery)}</dd></div>
          </dl>
          <button className="btn-primary mt-5 w-full" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          <Link to="/shop" className="btn-ghost mt-2 w-full">Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}
