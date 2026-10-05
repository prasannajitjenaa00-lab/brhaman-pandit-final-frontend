import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEdit2 as Pencil, FiPlus as Plus, FiStar as Star, FiTrash2 as Trash2 } from 'react-icons/fi';
import api, { errMsg } from '../../lib/api';
import { runAction } from '../../lib/actions';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Empty, ErrorBox, Field, Modal, Spinner, useFetch } from '../../components/ui';
import { ProductCard } from '../../components/Cards';
import { PASSWORD_RULE, PHONE_RULE, PIN_RULE } from '../../lib/format';

export function Profile() {
  const { user, setUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: user.name, phone: user.phone || '' } });
  const onSubmit = async (v) => {
    try {
      const r = await api.put('/auth/me', v);
      setUser(r.data.user);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <div className="card max-w-xl p-6 sm:p-8">
      <h1 className="mb-5 text-2xl">Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.name}><input className="input" {...register('name', { required: 'Name is required' })} /></Field>
        <Field label="Email"><input className="input bg-cream-100" value={user.email} disabled /></Field>
        <Field label="Phone" error={errors.phone}><input className="input" {...register('phone', { pattern: PHONE_RULE.pattern })} /></Field>
        <button className="btn-primary" disabled={isSubmitting}>Save changes</button>
      </form>
    </div>
  );
}

export function ChangePassword() {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const onSubmit = async (v) => {
    try {
      await api.put('/auth/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword });
      toast.success('Password updated');
      reset();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <div className="card max-w-xl p-6 sm:p-8">
      <h1 className="mb-5 text-2xl">Change Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Current password" error={errors.currentPassword}><input type="password" autoComplete="current-password" className="input" {...register('currentPassword', { required: 'Required' })} /></Field>
        <Field label="New password" error={errors.newPassword}><input type="password" autoComplete="new-password" className="input" {...register('newPassword', PASSWORD_RULE)} /></Field>
        <Field label="Confirm new password" error={errors.confirm}><input type="password" autoComplete="new-password" className="input" {...register('confirm', { validate: (v) => v === watch('newPassword') || 'Passwords do not match' })} /></Field>
        <button className="btn-primary" disabled={isSubmitting}>Update password</button>
      </form>
    </div>
  );
}

function AddressForm({ initial, onDone }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: initial || { label: 'Home' } });
  const onSubmit = async (v) => {
    try {
      initial?._id ? await api.put(`/me/addresses/${initial._id}`, v) : await api.post('/me/addresses', v);
      toast.success('Address saved');
      onDone();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Label"><input className="input" {...register('label')} placeholder="Home / Office" /></Field>
      <Field label="Full name" error={errors.fullName}><input className="input" {...register('fullName', { required: 'Required' })} /></Field>
      <Field label="Phone" error={errors.phone}><input className="input" {...register('phone', PHONE_RULE)} /></Field>
      <Field label="Pincode" error={errors.pincode}><input className="input" maxLength={6} {...register('pincode', PIN_RULE)} /></Field>
      <Field label="Address" error={errors.address} className="sm:col-span-2"><input className="input" {...register('address', { required: 'Required' })} /></Field>
      <Field label="City" error={errors.city}><input className="input" {...register('city', { required: 'Required' })} /></Field>
      <Field label="State" error={errors.state}><input className="input" {...register('state', { required: 'Required' })} /></Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="accent-maroon-600" {...register('isDefault')} /> Make default address</label>
      <button className="btn-primary sm:col-span-2" disabled={isSubmitting}>Save address</button>
    </form>
  );
}

export function Addresses() {
  const { data, loading, error, reload } = useFetch('/me/addresses');
  const [editing, setEditing] = useState(null); // {} for new
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  const remove = (id) => runAction(() => api.delete(`/me/addresses/${id}`), { confirm: 'Delete this address?', success: 'Address deleted', onDone: reload });
  return (
    <div>
      <div className="mb-5 flex items-center justify-between"><h1 className="text-2xl">Saved Addresses</h1><button className="btn-primary btn-sm" onClick={() => setEditing({})}><Plus size={14} /> Add address</button></div>
      {data.items.length === 0 ? <Empty title="No saved addresses" /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.items.map((a) => (
            <div key={a._id} className="card p-5 text-sm">
              <div className="mb-1 flex items-center justify-between"><p className="font-semibold">{a.label}{a.isDefault && <span className="badge ml-2 bg-saffron-100 text-saffron-600">Default</span>}</p>
                <span className="flex gap-1"><button aria-label="Edit" className="rounded-full p-1.5 hover:bg-cream-100" onClick={() => setEditing(a)}><Pencil size={15} /></button><button aria-label="Delete" className="rounded-full p-1.5 hover:bg-cream-100" onClick={() => remove(a._id)}><Trash2 size={15} /></button></span></div>
              <p>{a.fullName} · {a.phone}</p><p className="text-brown-600">{a.address}, {a.city}, {a.state} {a.pincode}</p>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit address' : 'New address'} wide>
        {editing && <AddressForm initial={editing._id ? editing : null} onDone={() => { setEditing(null); reload(); }} />}
      </Modal>
    </div>
  );
}

export function Wishlist() {
  const { data, loading, error } = useFetch('/me/wishlist');
  const { ids } = useWishlist();
  // items un-hearted on this page disappear immediately via the shared wishlist ids
  const items = data?.items.filter((p) => ids.includes(p._id)) || [];
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  return (
    <div>
      <h1 className="mb-5 flex items-center gap-2 text-2xl"><Star size={20} className="text-gold-500" /> Wishlist</h1>
      {items.length === 0 ? <Empty title="Your wishlist is empty" text="Tap the heart on any product to save it here." /> : <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{items.map((p) => <ProductCard key={p._id} product={p} />)}</div>}
    </div>
  );
}
