import { Link } from 'react-router-dom';
import { FiPlus as Plus } from 'react-icons/fi';
import api from '../../lib/api';
import { runAction } from '../../lib/actions';
import { ActiveBadge, DataTable, FilterSelect, PageHeader, SearchBox, ViewLink, useList } from '../../components/AdminUI';
import { Img, StatusBadge, useFetch } from '../../components/ui';
import { money } from '../../lib/format';

export default function AdminProducts() {
  const list = useList('/admin/products');
  const cats = useFetch('/admin/categories');
  const deactivate = (p) => runAction(() => api.delete(`/admin/products/${p._id}`), { confirm: `Deactivate "${p.name}"?`, success: 'Product deactivated', onDone: list.reload });
  return (
    <>
      <PageHeader title="Products" action={<div className="flex flex-wrap gap-2"><SearchBox value={list.filters.q} onChange={(v) => list.set('q', v)} placeholder="Name or SKU" /><FilterSelect placeholder="All categories" value={list.filters.category} onChange={(v) => list.set('category', v)} options={(cats.data?.items || []).map((c) => ({ value: c._id, label: c.name }))} /><FilterSelect placeholder="Any status" value={list.filters.status} onChange={(v) => list.set('status', v)} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} /><Link to="/admin/products/create" className="btn-primary btn-sm"><Plus size={14} /> Add Product</Link></div>} />
      <DataTable list={list} columns={[
        { header: 'Product', render: (p) => <div className="flex items-center gap-3"><Img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg" /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-brown-500">{p.sku}</p></div></div> },
        { header: 'Category', render: (p) => p.category?.name },
        { header: 'Price', render: (p) => <>{money(p.sellingPrice)}{p.discountPercent > 0 && <span className="ml-1 text-xs text-brown-400 line-through">{money(p.price)}</span>}</> },
        { header: 'Stock', render: (p) => <div className="flex items-center gap-2">{p.stock}<StatusBadge status={p.stockStatus} /></div> },
        { header: 'Status', render: (p) => <ActiveBadge active={p.isActive} /> },
        { header: 'Actions', render: (p) => <div className="flex gap-2"><ViewLink to={`/admin/products/${p._id}`}>Edit</ViewLink>{p.isActive && <button className="btn btn-sm btn-danger" onClick={() => deactivate(p)}>Deactivate</button>}</div> },
      ]} />
    </>
  );
}
