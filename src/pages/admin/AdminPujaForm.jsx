import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../lib/api';
import { Field, Img, Spinner, useFetch } from '../../components/ui';
import { PageHeader, Toggle, fromList, toList } from '../../components/AdminUI';
import { useSite } from '../../context/SiteContext';

const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

export default function AdminPujaForm() {
  const { id } = useParams();
  const { meta } = useSite();
  const editing = !!id;
  const navigate = useNavigate();
  const puja = useFetch(editing ? `/admin/pujas/${id}` : null);
  const products = useFetch('/admin/products', { limit: 100 });
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: { isActive: true, priceFrom: 0, recommendedProducts: [] } });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const p = puja.data?.puja;
    if (p) reset({ ...p, benefits: (p.benefits || []).join('\n'), requiredSamagri: (p.requiredSamagri || []).join('\n'), languages: fromList(p.languages), locations: fromList(p.locations), recommendedProducts: (p.recommendedProducts || []).map((x) => x._id) });
  }, [puja.data, reset]);

  if (editing && puja.loading) return <Spinner />;
  const rec = watch('recommendedProducts') || [];

  const onSubmit = async (v) => {
    const payload = { name: v.name, category: v.category, shortDescription: v.shortDescription, description: v.description, duration: v.duration, priceFrom: Number(v.priceFrom) || 0, benefits: lines(v.benefits), requiredSamagri: lines(v.requiredSamagri), languages: toList(v.languages), locations: toList(v.locations), recommendedProducts: rec, isActive: !!v.isActive };
    const fd = new FormData();
    fd.append('data', JSON.stringify(payload));
    if (image) fd.append('image', image);
    try {
      editing ? await api.put(`/admin/pujas/${id}`, fd) : await api.post('/admin/pujas', fd);
      toast.success('Puja saved');
      navigate('/admin/pujas');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <>
      <PageHeader title={editing ? 'Edit Puja' : 'Create Puja'} />
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-4xl gap-5">
        <div className="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <Img src={image ? URL.createObjectURL(image) : puja.data?.puja?.image} alt="" className="h-20 w-28 rounded-xl" />
            <div className="min-w-0"><label className="label">Image</label><input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} className="text-sm" /></div>
          </div>
          <Field label="Name *" error={errors.name}><input className="input" {...register('name', { required: 'Name is required' })} /></Field>
          <Field label="Category"><select className="input" {...register('category')}>{meta.pujaCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Starting price (₹)"><input type="number" min="0" className="input" {...register('priceFrom')} /></Field>
          <Field label="Duration"><input className="input" placeholder="2–3 hours" {...register('duration')} /></Field>
          <Field label="Languages (comma separated)"><input className="input" {...register('languages')} /></Field>
          <Field label="Available locations (comma separated)" className="sm:col-span-2"><input className="input" {...register('locations')} /></Field>
          <Field label="Short description" className="sm:col-span-2"><input className="input" maxLength={200} {...register('shortDescription')} /></Field>
          <Field label="Description" className="sm:col-span-2"><textarea className="input min-h-28" {...register('description')} /></Field>
          <Field label="Benefits (one per line)"><textarea className="input min-h-28" {...register('benefits')} /></Field>
          <Field label="Required Samagri (one per line)"><textarea className="input min-h-28" {...register('requiredSamagri')} /></Field>
        </div>
        <div className="card p-6">
          <h3 className="mb-3 text-lg">Recommended products</h3>
          <div className="grid grid-cols-1 max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
            {products.data?.items.map((p) => <Toggle key={p._id} label={p.name} checked={rec.includes(p._id)} onChange={() => setValue('recommendedProducts', rec.includes(p._id) ? rec.filter((x) => x !== p._id) : [...rec, p._id])} />)}
          </div>
        </div>
        <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <Toggle label="Active (visible on website)" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
          <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={() => navigate('/admin/pujas')}>Cancel</button><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Puja'}</button></div>
        </div>
      </form>
    </>
  );
}
