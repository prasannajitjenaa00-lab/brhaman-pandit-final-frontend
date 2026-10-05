import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus as Plus } from 'react-icons/fi';
import api, { errMsg } from '../../lib/api';
import { runAction } from '../../lib/actions';
import { ErrorBox, Field, Modal, Spinner, useFetch } from '../../components/ui';
import { ActiveBadge, PageHeader, Toggle } from '../../components/AdminUI';
import { fmtDate, money, toInputDate } from '../../lib/format';

function CouponForm({ initial, onDone }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initial ? { ...initial, startDate: toInputDate(initial.startDate), expiryDate: toInputDate(initial.expiryDate) } : { discountType: 'PERCENT', isActive: true, minOrder: 0, maxDiscount: 0, usageLimit: 0 },
  });
  const onSubmit = async (v) => {
    const payload = { code: v.code, description: v.description, discountType: v.discountType, discountValue: Number(v.discountValue), minOrder: Number(v.minOrder) || 0, maxDiscount: Number(v.maxDiscount) || 0, usageLimit: Number(v.usageLimit) || 0, startDate: v.startDate, expiryDate: v.expiryDate, isActive: !!v.isActive };
    try {
      initial?._id ? await api.put(`/admin/coupons/${initial._id}`, payload) : await api.post('/admin/coupons', payload);
      toast.success('Coupon saved');
      onDone();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Coupon code *" error={errors.code}><input className="input uppercase" {...register('code', { required: 'Code is required' })} /></Field>
      <Field label="Discount type"><select className="input" {...register('discountType')}><option value="PERCENT">Percentage (%)</option><option value="FLAT">Flat amount (₹)</option></select></Field>
      <Field label="Discount value *" error={errors.discountValue}><input type="number" min="0" step="0.01" className="input" {...register('discountValue', { required: 'Required', min: { value: 0, message: '≥ 0' } })} /></Field>
      <Field label="Minimum order (₹)"><input type="number" min="0" className="input" {...register('minOrder')} /></Field>
      <Field label="Maximum discount (₹, 0 = no cap)"><input type="number" min="0" className="input" {...register('maxDiscount')} /></Field>
      <Field label="Usage limit (0 = unlimited)"><input type="number" min="0" className="input" {...register('usageLimit')} /></Field>
      <Field label="Start date"><input type="date" className="input" {...register('startDate')} /></Field>
      <Field label="Expiry date"><input type="date" className="input" {...register('expiryDate')} /></Field>
      <Field label="Description" className="sm:col-span-2"><input className="input" {...register('description')} /></Field>
      <div className="sm:col-span-2"><Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} /></div>
      <button className="btn-primary sm:col-span-2" disabled={isSubmitting}>Save coupon</button>
    </form>
  );
}

export default function AdminCoupons() {
  const { data, loading, error, reload } = useFetch('/admin/coupons');
  const [editing, setEditing] = useState(null);
  const remove = (c) => runAction(() => api.delete(`/admin/coupons/${c._id}`), { confirm: `Delete coupon ${c.code}?`, success: 'Coupon deleted', onDone: reload });
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  return (
    <>
      <PageHeader title="Coupons" action={<button className="btn-primary btn-sm" onClick={() => setEditing({})}><Plus size={14} /> New Coupon</button>} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-cream-200 bg-cream-50"><tr>{['Code', 'Discount', 'Min order', 'Validity', 'Used', 'Status', 'Actions'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-cream-200">
            {data.items.length === 0 && <tr><td colSpan="7" className="td py-10 text-center text-brown-400">No coupons yet</td></tr>}
            {data.items.map((c) => (
              <tr key={c._id}>
                <td className="td font-mono font-bold">{c.code}</td>
                <td className="td">{c.discountType === 'PERCENT' ? `${c.discountValue}%` : money(c.discountValue)}{c.maxDiscount > 0 && <span className="text-xs text-brown-500"> (max {money(c.maxDiscount)})</span>}</td>
                <td className="td">{money(c.minOrder)}</td>
                <td className="td text-xs">{c.startDate ? fmtDate(c.startDate, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Any time'} → {c.expiryDate ? fmtDate(c.expiryDate, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry'}</td>
                <td className="td">{c.usedCount}{c.usageLimit > 0 && ` / ${c.usageLimit}`}</td>
                <td className="td"><ActiveBadge active={c.isActive} /></td>
                <td className="td"><div className="flex gap-2"><button className="btn-outline btn-sm" onClick={() => setEditing(c)}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => remove(c)}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit coupon' : 'New coupon'} wide>
        {editing && <CouponForm initial={editing._id ? editing : null} onDone={() => { setEditing(null); reload(); }} />}
      </Modal>
    </>
  );
}
