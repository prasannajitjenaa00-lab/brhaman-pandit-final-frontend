import { useSearchParams } from 'react-router-dom';
import { DataTable, FilterSelect, PageHeader, SearchBox, ViewLink, useList } from '../../components/AdminUI';
import { StatusBadge } from '../../components/ui';
import { fmtDateTime, money } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

export default function AdminOrders() {
  const [sp] = useSearchParams();
  const { meta } = useSite();
  const list = useList('/admin/orders', { status: sp.get('status') || undefined });
  const f = list.filters;
  return (
    <>
      <PageHeader title="Orders" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBox value={f.q} onChange={(v) => list.set('q', v)} placeholder="Order ID, name, phone" />
        <FilterSelect placeholder="All statuses" value={f.status} onChange={(v) => list.set('status', v)} options={meta.orderStatuses} />
        <input type="date" className="input w-auto" aria-label="From date" value={f.from || ''} onChange={(e) => list.set('from', e.target.value)} />
        <input type="date" className="input w-auto" aria-label="To date" value={f.to || ''} onChange={(e) => list.set('to', e.target.value)} />
      </div>
      <DataTable list={list} columns={[
        { header: 'Order', render: (o) => <div><p className="font-semibold">{o.orderId}</p><p className="text-xs text-brown-500">{fmtDateTime(o.createdAt)}</p></div> },
        { header: 'Customer', render: (o) => <div><p>{o.shipping?.fullName}</p><p className="text-xs text-brown-500">{o.shipping?.city}</p></div> },
        { header: 'Items', render: (o) => o.items.length },
        { header: 'Total', render: (o) => money(o.total) },
        { header: 'Payment', render: (o) => <StatusBadge status={o.paymentStatus} /> },
        { header: 'Status', render: (o) => <StatusBadge status={o.orderStatus} /> },
        { header: '', render: (o) => <ViewLink to={`/admin/orders/${o._id}`} /> },
      ]} />
    </>
  );
}
