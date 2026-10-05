import { useState } from 'react';
import { ErrorBox, Spinner, useFetch } from '../../components/ui';
import { ChartGrid } from '../../components/Charts';
import { PageHeader } from '../../components/AdminUI';
import { money } from '../../lib/format';

const RANGES = [[7, 'Last 7 days'], [30, 'Last 30 days'], [90, 'Last 90 days'], [365, 'Last 12 months']];

export default function AdminReports() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useFetch('/admin/stats', { days });
  const totalIn = (arr, k) => (arr || []).reduce((n, r) => n + (r[k] || 0), 0);
  return (
    <>
      <PageHeader title="Reports" subtitle="Trends and top performers for the selected period." action={<select className="input w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))}>{RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>} />
      {loading ? <Spinner /> : error ? <ErrorBox message={error} /> : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[['Bookings in period', totalIn(data.bookingTrend, 'count')], ['Orders in period', totalIn(data.orderTrend, 'count')], ['Revenue in period', money(totalIn(data.revenueTrend, 'amount'))]].map(([l, v]) => (
              <div key={l} className="card p-5"><p className="text-3xl font-bold text-maroon-700">{v}</p><p className="text-sm text-brown-500">{l}</p></div>
            ))}
          </div>
          <ChartGrid stats={data} />
        </>
      )}
    </>
  );
}
