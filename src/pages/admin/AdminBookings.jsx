import { useSearchParams } from 'react-router-dom';
import { FiAlertCircle as AlertCircle } from 'react-icons/fi';
import { DataTable, FilterSelect, PageHeader, SearchBox, ViewLink, useList } from '../../components/AdminUI';
import { StatusBadge, useFetch } from '../../components/ui';
import { fmtDate, money } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

export default function AdminBookings() {
  const [sp] = useSearchParams();
  const { meta } = useSite();
  const list = useList('/admin/bookings', { status: sp.get('status') || undefined });
  const pujas = useFetch('/admin/pujas');
  const pandits = useFetch('/admin/pandits', { limit: 100 });
  const f = list.filters;
  return (
    <>
      <PageHeader title="Bookings" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBox value={f.q} onChange={(v) => list.set('q', v)} placeholder="ID, name, phone" />
        <FilterSelect placeholder="All statuses" value={f.status} onChange={(v) => list.set('status', v)} options={meta.bookingStatuses} />
        <FilterSelect placeholder="All Pujas" value={f.puja} onChange={(v) => list.set('puja', v)} options={(pujas.data?.items || []).map((p) => ({ value: p._id, label: p.name }))} />
        <FilterSelect placeholder="All Pandits" value={f.pandit} onChange={(v) => list.set('pandit', v)} options={(pandits.data?.items || []).map((p) => ({ value: p._id, label: p.name }))} />
        <SearchBox value={f.city} onChange={(v) => list.set('city', v)} placeholder="City" />
        <input type="date" className="input w-auto" aria-label="From date" value={f.from || ''} onChange={(e) => list.set('from', e.target.value)} />
        <input type="date" className="input w-auto" aria-label="To date" value={f.to || ''} onChange={(e) => list.set('to', e.target.value)} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-maroon-600" checked={f.requests === 'true'} onChange={(e) => list.set('requests', e.target.checked ? 'true' : '')} /> Has requests</label>
      </div>
      <DataTable list={list} columns={[
        { header: 'Booking', render: (b) => <div><p className="font-semibold">{b.bookingId}</p><p className="text-xs text-brown-500">{b.customerName}</p></div> },
        { header: 'Puja', render: (b) => b.puja?.name },
        { header: 'Pandit', render: (b) => b.pandit?.name || <span className="text-amber-700">Unassigned</span> },
        { header: 'Date', render: (b) => <span className="whitespace-nowrap">{fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}<br /><span className="text-xs text-brown-500">{b.time}</span></span> },
        { header: 'City', render: (b) => b.city },
        { header: 'Status', render: (b) => <div className="flex flex-col items-start gap-1"><StatusBadge status={b.bookingStatus} />{(b.cancellationRequested || b.rescheduleRequest?.requested) && <span className="flex items-center gap-1 text-xs text-amber-700"><AlertCircle size={12} /> Request pending</span>}</div> },
        { header: 'Payment', render: (b) => <StatusBadge status={b.paymentStatus} /> },
        { header: 'Amount', render: (b) => money(b.amount) },
        { header: '', render: (b) => <ViewLink to={`/admin/bookings/${b._id}`} /> },
      ]} />
    </>
  );
}
