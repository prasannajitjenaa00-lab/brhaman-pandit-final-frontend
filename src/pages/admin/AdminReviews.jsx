import api from '../../lib/api';
import { runAction } from '../../lib/actions';
import { DataTable, FilterSelect, PageHeader, useList } from '../../components/AdminUI';
import { Stars, StatusBadge } from '../../components/ui';
import { fmtDate } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

export default function AdminReviews() {
  const { meta } = useSite();
  const list = useList('/admin/reviews');
  const setStatus = (r, status) => runAction(() => api.patch(`/admin/reviews/${r._id}`, { status }), { success: status === 'APPROVED' ? 'Review approved' : 'Review hidden', onDone: list.reload });
  const remove = (r) => runAction(() => api.delete(`/admin/reviews/${r._id}`), { confirm: 'Permanently delete this review?', success: 'Review deleted', onDone: list.reload });
  return (
    <>
      <PageHeader title="Reviews" action={<div className="flex flex-wrap gap-2"><FilterSelect placeholder="All types" value={list.filters.type} onChange={(v) => list.set('type', v)} options={meta.reviewTypes} /><FilterSelect placeholder="All statuses" value={list.filters.status} onChange={(v) => list.set('status', v)} options={meta.reviewStatuses} /></div>} />
      <DataTable list={list} columns={[
        { header: 'Reviewer', render: (r) => <div><p className="font-semibold">{r.user?.name}</p><p className="text-xs text-brown-500">{fmtDate(r.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</p></div> },
        { header: 'For', render: (r) => <div><p>{r.product?.name || r.pandit?.name || r.puja?.name}</p><p className="text-xs text-brown-500">{r.targetType}{r.targetType === 'PANDIT' && r.puja ? ` · ${r.puja.name}` : ''}</p></div> },
        { header: 'Rating', render: (r) => <Stars value={r.rating} /> },
        { header: 'Comment', className: 'max-w-xs', render: (r) => <span className="line-clamp-2">{r.comment || '—'}</span> },
        { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        { header: 'Actions', render: (r) => (
          <div className="flex gap-2">
            {r.status === 'HIDDEN' ? <button className="btn-outline btn-sm" onClick={() => setStatus(r, 'APPROVED')}>Approve</button> : <button className="btn-outline btn-sm" onClick={() => setStatus(r, 'HIDDEN')}>Hide</button>}
            <button className="btn btn-sm btn-danger" onClick={() => remove(r)}>Delete</button>
          </div>
        ) },
      ]} />
    </>
  );
}
