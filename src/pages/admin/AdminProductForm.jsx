import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiX as X } from 'react-icons/fi';
import api, { errMsg } from '../../lib/api';
import { Field, Spinner, useFetch } from '../../components/ui';
import { PageHeader, Toggle } from '../../components/AdminUI';
import { assetUrl } from '../../lib/config';

const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

export default function AdminProductForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const product = useFetch(editing ? `/admin/products/${id}` : null);
  const cats = useFetch('/admin/categories');
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: { isActive: true, stock: 0, lowStockThreshold: 5 } });
  const [existing, setExisting] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const p = product.data?.product;
    if (!p) return;
    reset({ ...p, category: p.category, discountPrice: p.discountPrice ?? '', specifications: (p.specifications || []).map((s) => `${s.key}: ${s.value}`).join('\n'), includedItems: (p.includedItems || []).join('\n') });
    setExisting(p.images || []);
  }, [product.data, reset]);

  if (editing && product.loading) return <Spinner />;

  const onSubmit = async (v) => {
    const payload = {
      name: v.name, tagline: v.tagline, sku: v.sku, category: v.category, description: v.description, price: Number(v.price), discountPrice: v.discountPrice === '' ? '' : Number(v.discountPrice),
      stock: Number(v.stock) || 0, lowStockThreshold: Number(v.lowStockThreshold) || 0, isActive: !!v.isActive, includedItems: lines(v.includedItems),
      specifications: lines(v.specifications).map((l) => { const i = l.indexOf(':'); return i > 0 ? { key: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { key: l, value: '' }; }),
      existingImages: existing,
    };
    const fd = new FormData();
    fd.append('data', JSON.stringify(payload));
    files.forEach((f) => fd.append('images', f));
    try {
      editing ? await api.put(`/admin/products/${id}`, fd) : await api.post('/admin/products', fd);
      toast.success('Product saved');
      navigate('/admin/products');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <>
      <PageHeader title={editing ? 'Edit Product' : 'Add Product'} />
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-4xl gap-5">
        <div className="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <Field label="Name *" error={errors.name} className="sm:col-span-2"><input className="input" {...register('name', { required: 'Name is required' })} /></Field>
          <Field label="Tagline (shown on cards)" className="sm:col-span-2"><input className="input" maxLength={60} placeholder="e.g. Premium Quality" {...register('tagline')} /></Field>
          <Field label="SKU *" error={errors.sku}><input className="input" {...register('sku', { required: 'SKU is required' })} /></Field>
          <Field label="Category *" error={errors.category}>
            <select className="input" {...register('category', { required: 'Category is required' })}><option value="">Select…</option>{cats.data?.items.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
          </Field>
          <Field label="Price / MRP (₹) *" error={errors.price}><input type="number" min="0" step="0.01" className="input" {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be ≥ 0' } })} /></Field>
          <Field label="Discounted price (₹)" error={errors.discountPrice}><input type="number" min="0" step="0.01" className="input" placeholder="Leave empty for no discount" {...register('discountPrice', { validate: (d) => d === '' || d == null || Number(d) <= Number(watch('price')) || 'Cannot exceed price' })} /></Field>
          <Field label="Stock"><input type="number" min="0" className="input" {...register('stock')} /></Field>
          <Field label="Low-stock threshold"><input type="number" min="0" className="input" {...register('lowStockThreshold')} /></Field>
          <Field label="Description" className="sm:col-span-2"><textarea className="input min-h-28" {...register('description')} /></Field>
          <Field label="Specifications (one “Key: Value” per line)"><textarea className="input min-h-28" placeholder={'Material: Brass\nWeight: 250 g'} {...register('specifications')} /></Field>
          <Field label="Included items (one per line)"><textarea className="input min-h-28" {...register('includedItems')} /></Field>
        </div>

        <div className="card p-6">
          <h3 className="mb-3 text-lg">Images</h3>
          <div className="mb-3 flex flex-wrap gap-3">
            {existing.map((src) => (
              <div key={src} className="relative"><img src={assetUrl(src)} alt="" className="h-20 w-20 rounded-xl object-cover" /><button type="button" aria-label="Remove image" onClick={() => setExisting(existing.filter((x) => x !== src))} className="absolute -right-2 -top-2 rounded-full bg-red-600 p-0.5 text-white"><X size={14} /></button></div>
            ))}
            {files.map((f, i) => (
              <div key={i} className="relative"><img src={URL.createObjectURL(f)} alt="" className="h-20 w-20 rounded-xl object-cover ring-2 ring-saffron-400" /><button type="button" aria-label="Remove image" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-red-600 p-0.5 text-white"><X size={14} /></button></div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple className="text-sm" onChange={(e) => { setFiles([...files, ...e.target.files].slice(0, 8)); e.target.value = ''; }} />
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <Toggle label="Active (visible on website)" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} />
          <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={() => navigate('/admin/products')}>Cancel</button><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Product'}</button></div>
        </div>
      </form>
    </>
  );
}
