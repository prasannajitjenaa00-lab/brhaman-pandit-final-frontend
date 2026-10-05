import { Link } from 'react-router-dom';
import { MdVerified as BadgeCheck } from 'react-icons/md';
import { FiPlus as Plus } from 'react-icons/fi';
import api from '../../lib/api';
import { runAction } from '../../lib/actions';
import { ActiveBadge, DataTable, FilterSelect, PageHeader, SearchBox, ViewLink, useList } from '../../components/AdminUI';
import { Img } from '../../components/ui';
import { money } from '../../lib/format';

export default function AdminPandits() {
  const list = useList('/admin/pandits');
  const deactivate = (p) => runAction(() => api.delete(`/admin/pandits/${p._id}`), { confirm: `Deactivate ${p.name}? They will no longer appear on the website.`, success: 'Pandit deactivated', onDone: list.reload });
  return (
    <>
      <PageHeader title="Pandits" action={<div className="flex flex-wrap gap-2"><SearchBox value={list.filters.q} onChange={(v) => list.set('q', v)} placeholder="Search name" /><FilterSelect placeholder="All" value={list.filters.status} onChange={(v) => list.set('status', v)} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'unverified', label: 'Unverified' }]} /><Link to="/admin/pandits/create" className="btn-primary btn-sm"><Plus size={14} /> Add Pandit</Link></div>} />
      <DataTable list={list} columns={[
        { header: 'Pandit', render: (p) => <div className="flex items-center gap-3"><Img src={p.profileImage} alt="" className="h-10 w-10 rounded-full" /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-brown-500">{p.phone}</p></div></div> },
        { header: 'Location', render: (p) => [p.city, p.state].filter(Boolean).join(', ') || '—' },
        { header: 'Experience', render: (p) => `${p.experience} yrs` },
        { header: 'Price from', render: (p) => money(p.priceFrom) },
        { header: 'Rating', render: (p) => (p.rating ? `${p.rating} (${p.totalReviews})` : '—') },
        { header: 'Status', render: (p) => <div className="flex flex-wrap gap-1"><ActiveBadge active={p.isActive} />{p.isVerified ? <span className="badge bg-emerald-100 text-emerald-800"><BadgeCheck size={12} className="mr-0.5" />Verified</span> : <span className="badge bg-amber-100 text-amber-800">Unverified</span>}</div> },
        { header: 'Actions', render: (p) => <div className="flex gap-2"><ViewLink to={`/admin/pandits/${p._id}`}>Edit</ViewLink>{p.isActive && <button className="btn btn-sm btn-danger" onClick={() => deactivate(p)}>Deactivate</button>}</div> },
      ]} />
    </>
  );
}
