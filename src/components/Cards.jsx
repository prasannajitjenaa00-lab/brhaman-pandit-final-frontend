import { Link } from 'react-router-dom';
import { FiClock as Clock, FiHeart as Heart, FiMapPin as MapPin, FiShoppingBag as ShoppingBag, FiAward as Award, FiStar as Star, FiShoppingCart as Cart, FiGift as Gift, FiArrowRight as ArrowRight } from 'react-icons/fi';
import { MdVerified as BadgeCheck, MdTranslate as Languages } from 'react-icons/md';
import { Img } from './ui';
import { money } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export function PujaCard({ puja }) {
  return (
    <Link to={`/pujas/${puja.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <div className="overflow-hidden">
        <Img src={puja.image} alt={puja.name} className="aspect-[2/1] w-full transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl">{puja.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-brown-500">{puja.shortDescription}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brown-600">
          {puja.duration && <span className="flex items-center gap-1.5"><Clock size={14} className="text-saffron-600" /> {puja.duration}</span>}
          {puja.benefits?.[0] && <span className="flex min-w-0 items-center gap-1.5"><Gift size={14} className="shrink-0 text-saffron-600" /> <span className="truncate">{puja.benefits[0]}</span></span>}
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[11px] text-brown-400">Starting from</p>
            <p className="text-2xl font-bold text-maroon-700">{money(puja.priceFrom)}</p>
          </div>
          <span className="btn bg-gradient-to-b from-maroon-600 to-maroon-800 px-4 py-2 text-xs text-white shadow-soft">View Details <ArrowRight size={13} /></span>
        </div>
      </div>
    </Link>
  );
}

export function PanditCard({ pandit }) {
  const specs = pandit.specializations || [];
  return (
    <div className="card flex flex-col overflow-hidden p-4">
      <div className="flex gap-4">
        <Img src={pandit.profileImage} alt={pandit.name} className="h-36 w-28 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          {pandit.isVerified && <span className="badge mb-1 gap-1 bg-emerald-50 text-emerald-700"><BadgeCheck size={13} /> Verified</span>}
          <h3 className="truncate text-xl">{pandit.name}</h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm"><Star size={14} className="fill-gold-500 text-gold-500" /><span className="font-bold">{pandit.rating ? pandit.rating.toFixed(1) : 'New'}</span>{pandit.totalReviews > 0 && <span className="text-sky-700">({pandit.totalReviews} reviews)</span>}</div>
          <ul className="mt-2 space-y-1 text-sm text-brown-600">
            <li className="flex items-center gap-2"><Award size={14} className="shrink-0 text-maroon-600" /> <span className="text-sky-700">{pandit.experience}+ Years Experience</span></li>
            <li className="flex items-center gap-2"><MapPin size={14} className="shrink-0 text-maroon-600" /> <span className="truncate">{[pandit.city, pandit.state].filter(Boolean).join(', ')}</span></li>
            <li className="flex items-center gap-2"><Languages size={14} className="shrink-0 text-maroon-600" /> <span className="truncate text-sky-700">{pandit.languages?.join(', ')}</span></li>
          </ul>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-maroon-700">Specializations:</span>
        {specs.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-saffron-50 px-2.5 py-1 text-[11px] text-brown-700">{s}</span>)}
        {specs.length > 3 && <span className="rounded-full border border-cream-300 px-2 py-1 text-[11px] text-brown-500">+{specs.length - 3} more</span>}
      </div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
        <div>
          <p className="text-[11px] text-brown-400">Starting from</p>
          <p className="text-2xl font-bold text-maroon-700">{money(pandit.priceFrom)}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/pandits/${pandit._id}`} className="btn btn-sm border border-maroon-600 px-4 text-maroon-700 hover:bg-maroon-50">View Profile</Link>
          <Link to={`/book?pandit=${pandit._id}`} className="btn btn-sm bg-maroon-700 px-4 text-white hover:bg-maroon-800">Book Now</Link>
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product }) {
  const { add } = useCart();
  const wish = useWishlist();
  const out = product.stock <= 0;
  const liked = wish.has(product._id);
  return (
    <div className="card group relative flex flex-col overflow-hidden p-2.5 transition hover:shadow-lift">
      {product.discountPercent > 0 && <span className="absolute left-4 top-4 z-10 rounded-full bg-saffron-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">{product.discountPercent}% OFF</span>}
      <button
        onClick={() => wish.toggle(product._id)}
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={liked}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-soft hover:bg-white"
      >
        <Heart size={16} className={liked ? 'fill-maroon-600 text-maroon-600' : 'text-maroon-600'} />
      </button>
      <Link to={`/shop/${product.slug}`} className="block overflow-hidden rounded-xl">
        <Img src={product.images?.[0]} alt={product.name} icon={ShoppingBag} className="aspect-[3/2] w-full transition duration-500 group-hover:scale-[1.05]" />
      </Link>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <Link to={`/shop/${product.slug}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-brown-900 hover:text-maroon-600 sm:line-clamp-1 sm:min-h-0">{product.name}</Link>
        <p className="line-clamp-1 text-xs text-brown-500">{product.tagline || product.category?.name || ' '}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <Star size={13} className="fill-gold-500 text-gold-500" />
          <span className="font-semibold text-brown-700">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
          {product.reviewCount > 0 && <span className="text-brown-400">({product.reviewCount})</span>}
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-lg font-bold text-maroon-700">{money(product.sellingPrice)}</span>
          {product.discountPercent > 0 && <span className="text-xs text-brown-400 line-through">{money(product.price)}</span>}
        </div>
        <button className="btn mt-3 w-full rounded-lg bg-maroon-700 py-2.5 text-xs text-white hover:bg-maroon-800" disabled={out} onClick={() => add(product)}>
          <Cart size={14} /> {out ? 'Out of stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
