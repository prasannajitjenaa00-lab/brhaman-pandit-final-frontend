import { Link } from 'react-router-dom';
import { FiPlus as Plus } from 'react-icons/fi';
import api from '../../lib/api';
import { runAction } from '../../lib/actions';
import { ActiveBadge, DataTable, PageHeader, SearchBox, ViewLink, useList } from '../../components/AdminUI';
import { Img } from '../../components/ui';
import { money } from '../../lib/format';

export default function AdminPujas() {
  const list = useList('/admin/pujas');
  const deactivate = (p) => runAction(() => api.delete(`/admin/pujas/${p._id}`), { confirm: `Deactivate "${p.name}"?`, success: 'Puja deactivated', onDone: list.reload });
  return (
    <>
      <PageHeader title="Puja Services" action={<div className="flex flex-wrap gap-2"><SearchBox value={list.filters.q} onChange={(v) => list.set('q', v)} /><Link to="/admin/pujas/create" className="btn-primary btn-sm"><Plus size={14} /> Add Puja</Link></div>} />
      <DataTable list={list} columns={[
        { header: 'Puja', render: (p) => <div className="flex items-center gap-3"><Img src={p.image} alt="" className="h-10 w-10 rounded-lg" /><span className="font-semibold">{p.name}</span></div> },
        { header: 'Duration', render: (p) => p.duration || '—' },
        { header: 'Price from', render: (p) => money(p.priceFrom) },
        { header: 'Status', render: (p) => <ActiveBadge active={p.isActive} /> },
        { header: 'Actions', render: (p) => <div className="flex gap-2"><ViewLink to={`/admin/pujas/${p._id}`}>Edit</ViewLink>{p.isActive && <button className="btn btn-sm btn-danger" onClick={() => deactivate(p)}>Deactivate</button>}</div> },
      ]} />
    </>
  );
}
