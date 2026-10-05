import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiHeart as Heart, FiMinus as Minus, FiPlus as Plus, FiShoppingBag as ShoppingBag } from 'react-icons/fi';
import { ErrorBox, Img, Spinner, Stars, StatusBadge, useFetch } from '../components/ui';
import { ProductCard } from '../components/Cards';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fmtDate, money } from '../lib/format';

export default function ProductDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/products/${slug}`);
  const { add } = useCart();
  const wish = useWishlist();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-16"><ErrorBox message={error} /></div>;
  const { product: p, reviews, related } = data;
  const out = p.stock <= 0;
  const liked = wish.has(p._id);

  return (
    <div className="container-x py-10">
      <nav className="mb-5 text-sm text-brown-500"><Link to="/shop" className="hover:text-maroon-600">Shop</Link> / <Link to={`/shop?category=${p.category?.slug}`} className="hover:text-maroon-600">{p.category?.name}</Link></nav>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Img src={p.images?.[active]} alt={p.name} icon={ShoppingBag} className="aspect-square w-full rounded-3xl shadow-soft" />
          {p.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {p.images.map((im, i) => (
                <button key={im} onClick={() => setActive(i)} className={`shrink-0 overflow-hidden rounded-xl border-2 ${i === active ? 'border-maroon-600' : 'border-transparent'}`}><Img src={im} alt="" className="h-16 w-16" /></button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{p.name}</h1>
          <div className="mt-2 flex items-center gap-3"><Stars value={p.rating} count={p.reviewCount} size={16} /><span className="text-xs text-brown-400">SKU: {p.sku}</span></div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-maroon-700">{money(p.sellingPrice)}</span>
            {p.discountPercent > 0 && <><span className="text-lg text-brown-400 line-through">{money(p.price)}</span><span className="badge bg-saffron-500 text-white">{p.discountPercent}% OFF</span></>}
          </div>
          <div className="mt-3"><StatusBadge status={p.stockStatus} />{p.stock > 0 && p.stock <= p.lowStockThreshold && <span className="ml-2 text-xs text-amber-700">Only {p.stock} left</span>}</div>
          <p className="mt-5 text-brown-600">{p.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-cream-300 bg-white">
              <button className="p-3" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button className="p-3" aria-label="Increase" onClick={() => setQty((q) => Math.min(p.stock, q + 1))}><Plus size={14} /></button>
            </div>
            <button className="btn-primary" disabled={out} onClick={() => add(p, qty)}>Add to Cart</button>
            <button className="btn-gold" disabled={out} onClick={() => { add(p, qty); navigate('/checkout'); }}>Buy Now</button>
            <button className="rounded-full border border-cream-300 bg-white p-3" aria-label="Wishlist" onClick={() => wish.toggle(p._id)}><Heart size={18} className={liked ? 'fill-maroon-600 text-maroon-600' : ''} /></button>
          </div>
          <p className="mt-3 text-xs text-brown-500">Cash on Delivery / Pay Later available.</p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {p.specifications?.length > 0 && (
          <div className="card p-6"><h2 className="mb-3 text-xl">Specifications</h2>
            <dl className="divide-y divide-cream-200 text-sm">{p.specifications.map((s) => <div key={s._id || s.key} className="flex justify-between gap-4 py-2.5"><dt className="text-brown-500">{s.key}</dt><dd className="font-medium">{s.value}</dd></div>)}</dl>
          </div>
        )}
        {p.includedItems?.length > 0 && (
          <div className="card p-6"><h2 className="mb-3 text-xl">Included Items</h2><ul className="list-inside list-disc space-y-1.5 text-sm text-brown-600">{p.includedItems.map((i) => <li key={i}>{i}</li>)}</ul></div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl">Reviews</h2>
        {reviews.length === 0 ? <p className="text-brown-500">No reviews yet.</p> : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{reviews.map((r) => (
            <div key={r._id} className="card p-5"><div className="flex justify-between"><p className="font-semibold">{r.user?.name || 'Customer'}</p><Stars value={r.rating} /></div>{r.comment && <p className="mt-2 text-sm text-brown-600">{r.comment}</p>}<p className="mt-2 text-xs text-brown-400">{fmtDate(r.createdAt)}</p></div>
          ))}</div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-14"><h2 className="mb-5 text-2xl">Related Products</h2><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map((r) => <ProductCard key={r._id} product={r} />)}</div></div>
      )}
    </div>
  );
}
