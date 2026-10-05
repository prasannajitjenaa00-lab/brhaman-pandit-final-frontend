import { useState } from 'react';
import api from '../../lib/api';
import { runAction } from '../../lib/actions';
import { DataTable, FilterSelect, PageHeader, SearchBox, useList } from '../../components/AdminUI';
import { Modal, Spinner, StatusBadge, useFetch } from '../../components/ui';
import { fmtDate, money } from '../../lib/format';

function UserDetail({ id, onClose }) {
  const { data, loading } = useFetch(`/admin/users/${id}`);
  return (
    <Modal open onClose={onClose} title="User details" wide>
      {loading ? <Spinner /> : (
        <div className="space-y-5 text-sm">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <p><span className="text-brown-500">Name:</span> <strong>{data.user.name}</strong></p>
            <p><span className="text-brown-500">Email:</span> {data.user.email}</p>
            <p><span className="text-brown-500">Phone:</span> {data.user.phone || '—'}</p>
            <p><span className="text-brown-500">Joined:</span> {fmtDate(data.user.createdAt)}</p>
          </div>
          <div>
            <h4 className="mb-2 font-sans font-semibold">Bookings ({data.bookings.length})</h4>
            {data.bookings.length === 0 ? <p className="text-brown-400">None</p> : data.bookings.map((b) => <p key={b._id} className="flex justify-between border-b border-cream-200 py-1.5"><span>{b.bookingId} · {b.puja?.name}</span><StatusBadge status={b.bookingStatus} /></p>)}
          </div>
          <div>
            <h4 className="mb-2 font-sans font-semibold">Orders ({data.orders.length})</h4>
            {data.orders.length === 0 ? <p className="text-brown-400">None</p> : data.orders.map((o) => <p key={o._id} className="flex justify-between border-b border-cream-200 py-1.5"><span>{o.orderId} · {money(o.total)}</span><StatusBadge status={o.orderStatus} /></p>)}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminUsers() {
  const list = useList('/admin/users');
  const [viewing, setViewing] = useState(null);

  const toggle = (u) => runAction(() => api.patch(`/admin/users/${u._id}/${u.isBlocked ? 'unblock' : 'block'}`), {
    confirm: `${u.isBlocked ? 'Unblock' : 'Block'} ${u.name}?`, success: u.isBlocked ? 'User unblocked' : 'User blocked', onDone: list.reload,
  });

  return (
    <>
      <PageHeader title="Users" action={<div className="flex flex-wrap gap-2"><SearchBox value={list.filters.q} onChange={(v) => list.set('q', v)} placeholder="Name, email, phone" /><FilterSelect placeholder="All users" value={list.filters.status} onChange={(v) => list.set('status', v)} options={[{ value: 'active', label: 'Active' }, { value: 'blocked', label: 'Blocked' }]} /></div>} />
      <DataTable list={list} columns={[
        { header: 'Name', render: (u) => <span className="font-semibold">{u.name}</span> },
        { header: 'Email', render: (u) => u.email },
        { header: 'Phone', render: (u) => u.phone || '—' },
        { header: 'Role', render: (u) => <span className="badge bg-cream-200 text-maroon-700">{u.role}</span> },
        { header: 'Joined', render: (u) => fmtDate(u.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) },
        { header: 'Status', render: (u) => <span className={`badge ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span> },
        { header: 'Actions', render: (u) => (
          <div className="flex gap-2">
            <button className="btn-outline btn-sm" onClick={() => setViewing(u._id)}>View</button>
            {u.role !== 'ADMIN' && <button className={`btn-sm ${u.isBlocked ? 'btn-outline' : 'btn-danger'} btn`} onClick={() => toggle(u)}>{u.isBlocked ? 'Unblock' : 'Block'}</button>}
          </div>
        ) },
      ]} />
      {viewing && <UserDetail id={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
