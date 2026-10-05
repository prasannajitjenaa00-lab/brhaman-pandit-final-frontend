import { Link } from 'react-router-dom';
import { FiAlertTriangle as AlertTriangle, FiCheckCircle as CheckCircle2, FiClock as Clock, FiPackage as Package, FiBox as PackageOpen, FiShoppingBag as ShoppingBag, FiUsers as Users } from 'react-icons/fi';
import { FaUserTie as BookUser, FaRegCalendarCheck as CalendarCheck, FaRupeeSign as IndianRupee } from 'react-icons/fa';
import { ErrorBox, Spinner, useFetch } from '../../components/ui';
import { ChartGrid } from '../../components/Charts';
import { PageHeader } from '../../components/AdminUI';
import { money } from '../../lib/format';

export default function AdminDashboard() {
  const { data, loading, error } = useFetch('/admin/stats', { days: 30 });
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  const c = data.cards;
  const cards = [
    ['Total Users', c.totalUsers, Users, '/admin/users'],
    ['Total Pandits', c.totalPandits, BookUser, '/admin/pandits'],
    ['Total Bookings', c.totalBookings, CalendarCheck, '/admin/bookings'],
    ['Pending Bookings', c.pendingBookings, Clock, '/admin/bookings?status=PENDING', c.pendingBookings > 0],
    ['Completed Bookings', c.completedBookings, CheckCircle2, '/admin/bookings?status=COMPLETED'],
    ['Total Orders', c.totalOrders, Package, '/admin/orders'],
    ['Pending Orders', c.pendingOrders, PackageOpen, '/admin/orders?status=PLACED', c.pendingOrders > 0],
    ['Total Products', c.totalProducts, ShoppingBag, '/admin/products'],
    ['Low Stock Products', c.lowStockProducts, AlertTriangle, '/admin/inventory?status=LOW', c.lowStockProducts > 0],
    ['Total Revenue', money(c.totalRevenue), IndianRupee, '/admin/reports'],
  ];
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Last 30 days of activity. Revenue = delivered orders + completed bookings." />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(([l, v, I, to, alert]) => (
          <Link key={l} to={to} className="card p-4 transition hover:shadow-lift">
            <div className="flex items-center justify-between"><I size={18} className={alert ? 'text-red-600' : 'text-saffron-600'} />{alert && <span className="h-2 w-2 rounded-full bg-red-500" />}</div>
            <p className="mt-3 text-2xl font-bold text-maroon-700">{v}</p>
            <p className="text-xs text-brown-500">{l}</p>
          </Link>
        ))}
      </div>
      <ChartGrid stats={data} />
    </>
  );
}
