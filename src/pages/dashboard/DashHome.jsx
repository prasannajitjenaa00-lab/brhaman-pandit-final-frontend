import { Link } from 'react-router-dom';
import { FaRegCalendarCheck as CalendarCheck } from 'react-icons/fa';
import { FiCheckCircle as CheckCircle2, FiMapPin as MapPin, FiPackage as Package, FiClock as Clock, FiShoppingBag as ShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ErrorBox, Spinner, StatusBadge, useFetch } from '../../components/ui';
import { fmtDate, money } from '../../lib/format';

export default function DashHome() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch('/me/dashboard');
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  const { stats, upcomingBooking: b, upcomingOrder: o } = data;

  const tiles = [
    ['Total Bookings', stats.totalBookings, CalendarCheck],
    ['Upcoming Bookings', stats.upcomingBookings, Clock],
    ['Completed Pujas', stats.completedPujas, CheckCircle2],
    ['Total Orders', stats.totalOrders, Package],
  ];

  return (
    <div className="space-y-6">
      <div className="card motif bg-gradient-to-r from-maroon-700 to-maroon-600 p-6 text-white sm:p-8">
        <p className="text-sm text-gold-300">Namaste 🙏</p>
        <h1 className="mt-1 text-3xl !text-white">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-cream-200">Here’s what’s happening with your Pujas and orders.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map(([l, v, I]) => (
          <div key={l} className="card p-5"><I size={20} className="text-saffron-600" /><p className="mt-3 text-3xl font-bold text-maroon-700">{v}</p><p className="text-xs text-brown-500">{l}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 text-lg">Upcoming Booking</h2>
          {b ? (
            <Link to={`/dashboard/bookings/${b._id}`} className="block">
              <p className="text-xl font-semibold">{b.puja?.name}</p>
              <p className="mt-1 text-sm text-brown-600">{fmtDate(b.date)} · {b.time}</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-brown-500"><MapPin size={13} /> {b.city}</p>
              <div className="mt-3"><StatusBadge status={b.bookingStatus} /></div>
            </Link>
          ) : <div className="text-sm text-brown-500">No upcoming bookings. <Link to="/pandits" className="font-semibold text-maroon-600">Book a Pandit</Link></div>}
        </div>
        <div className="card p-6">
          <h2 className="mb-3 text-lg">Upcoming Order</h2>
          {o ? (
            <Link to={`/dashboard/orders/${o._id}`} className="block">
              <p className="text-xl font-semibold">Order #{o.orderId}</p>
              <p className="mt-1 text-sm text-brown-600">{o.items?.length} item(s) · {money(o.total)}</p>
              <div className="mt-3"><StatusBadge status={o.orderStatus} /></div>
            </Link>
          ) : <div className="text-sm text-brown-500">No active orders. <Link to="/shop" className="font-semibold text-maroon-600">Shop Puja Samagri</Link></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/pandits" className="btn-primary py-3"><CalendarCheck size={16} /> Book a Pandit</Link>
        <Link to="/shop" className="btn-outline py-3"><ShoppingBag size={16} /> Shop Puja Samagri</Link>
      </div>
    </div>
  );
}
