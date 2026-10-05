import api from '../../lib/api';
import { runAction } from '../../lib/actions';
import { DataTable, PageHeader, useList } from '../../components/AdminUI';
import { StatusBadge } from '../../components/ui';
import { fmtDateTime } from '../../lib/format';

export default function AdminMessages() {
  const list = useList('/admin/messages');
  const setStatus = (m, status) => runAction(() => api.patch(`/admin/messages/${m._id}`, { status }), { onDone: list.reload });
  return (
    <>
      <PageHeader title="Contact Enquiries" />
      <DataTable list={list} columns={[
        { header: 'From', render: (m) => <div><p className="font-semibold">{m.name}</p><p className="text-xs text-brown-500">{m.email}{m.phone && ` · ${m.phone}`}</p></div> },
        { header: 'Enquiry', className: 'max-w-md', render: (m) => <div><p className="font-semibold">{m.subject}</p><p className="whitespace-pre-wrap text-brown-600">{m.message}</p></div> },
        { header: 'Received', render: (m) => <span className="whitespace-nowrap text-xs">{fmtDateTime(m.createdAt)}</span> },
        { header: 'Status', render: (m) => <StatusBadge status={m.status} /> },
        { header: 'Actions', render: (m) => <div className="flex gap-2"><a className="btn-outline btn-sm" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}>Reply</a>{m.status !== 'RESOLVED' && <button className="btn-primary btn-sm" onClick={() => setStatus(m, 'RESOLVED')}>Resolve</button>}</div> },
      ]} />
    </>
  );
}
