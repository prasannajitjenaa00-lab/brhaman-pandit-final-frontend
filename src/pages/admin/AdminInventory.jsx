import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../lib/api';
import { DataTable, FilterSelect, PageHeader, SearchBox, useList } from '../../components/AdminUI';
import { StatusBadge } from '../../components/ui';

function StockCell({ p, onSaved }) {
  const [stock, setStock] = useState(p.stock);
  const [threshold, setThreshold] = useState(p.lowStockThreshold);
  const dirty = Number(stock) !== p.stock || Number(threshold) !== p.lowStockThreshold;
  const save = async () => {
    try {
      await api.patch(`/admin/inventory/${p._id}`, { stock: Number(stock), lowStockThreshold: Number(threshold) });
      toast.success('Inventory updated');
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <div className="flex items-center gap-2">
      <input type="number" min="0" aria-label="Stock" className="input w-20 py-1.5" value={stock} onChange={(e) => setStock(e.target.value)} />
      <span className="text-xs text-brown-400">alert ≤</span>
      <input type="number" min="0" aria-label="Low stock threshold" className="input w-16 py-1.5" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
      <button className="btn-primary btn-sm" disabled={!dirty} onClick={save}>Save</button>
    </div>
  );
}

export default function AdminInventory() {
  const [sp] = useSearchParams();
  const list = useList('/admin/inventory', { status: sp.get('status') || undefined }, 30);
  return (
    <>
      <PageHeader title="Inventory" action={<div className="flex flex-wrap gap-2"><SearchBox value={list.filters.q} onChange={(v) => list.set('q', v)} placeholder="Name or SKU" /><FilterSelect placeholder="All stock levels" value={list.filters.status} onChange={(v) => list.set('status', v)} options={[{ value: 'IN', label: 'In stock' }, { value: 'LOW', label: 'Low stock' }, { value: 'OUT', label: 'Out of stock' }]} /></div>} />
      <DataTable list={list} columns={[
        { header: 'Product', render: (p) => <span className="font-semibold">{p.name}</span> },
        { header: 'SKU', render: (p) => p.sku },
        { header: 'Current stock & threshold', render: (p) => <StockCell key={`${p._id}-${p.stock}-${p.lowStockThreshold}`} p={p} onSaved={list.reload} /> },
        { header: 'Status', render: (p) => <StatusBadge status={p.stockStatus} /> },
      ]} />
    </>
  );
}
