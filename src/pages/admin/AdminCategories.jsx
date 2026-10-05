import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus as Plus } from 'react-icons/fi';
import api, { errMsg } from '../../lib/api';
import { runAction } from '../../lib/actions';
import { Field, Img, Modal, Spinner, ErrorBox, useFetch } from '../../components/ui';
import { ActiveBadge, PageHeader, Toggle } from '../../components/AdminUI';

function CategoryForm({ initial, onDone }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: { isActive: true, ...initial } });
  const [image, setImage] = useState(null);
  const onSubmit = async (v) => {
    const fd = new FormData();
    fd.append('data', JSON.stringify({ name: v.name, description: v.description, isActive: !!v.isActive }));
    if (image) fd.append('image', image);
    try {
      initial?._id ? await api.put(`/admin/categories/${initial._id}`, fd) : await api.post('/admin/categories', fd);
      toast.success('Category saved');
      onDone();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Name *" error={errors.name}><input className="input" {...register('name', { required: 'Name is required' })} /></Field>
      <Field label="Description"><textarea className="input" {...register('description')} /></Field>
      <div><label className="label">Image</label><input type="file" accept="image/*" className="text-sm" onChange={(e) => setImage(e.target.files[0] || null)} /></div>
      <Toggle label="Active" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
      <button className="btn-primary w-full" disabled={isSubmitting}>Save</button>
    </form>
  );
}

export default function AdminCategories() {
  const { data, loading, error, reload } = useFetch('/admin/categories');
  const [editing, setEditing] = useState(null);
  const remove = (c) => runAction(() => api.delete(`/admin/categories/${c._id}`), { confirm: `Delete "${c.name}"?`, success: 'Category deleted', onDone: reload });
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  return (
    <>
      <PageHeader title="Categories" action={<button className="btn-primary btn-sm" onClick={() => setEditing({})}><Plus size={14} /> Add Category</button>} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead className="border-b border-cream-200 bg-cream-50"><tr>{['Category', 'Slug', 'Status', 'Actions'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-cream-200">
            {data.items.map((c) => (
              <tr key={c._id}>
                <td className="td"><div className="flex items-center gap-3"><Img src={c.image} alt="" className="h-10 w-10 rounded-lg" /><span className="font-semibold">{c.name}</span></div></td>
                <td className="td text-brown-500">{c.slug}</td>
                <td className="td"><ActiveBadge active={c.isActive} /></td>
                <td className="td"><div className="flex gap-2"><button className="btn-outline btn-sm" onClick={() => setEditing(c)}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => remove(c)}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? 'Edit category' : 'New category'}>
        {editing && <CategoryForm initial={editing._id ? editing : null} onDone={() => { setEditing(null); reload(); }} />}
      </Modal>
    </>
  );
}
