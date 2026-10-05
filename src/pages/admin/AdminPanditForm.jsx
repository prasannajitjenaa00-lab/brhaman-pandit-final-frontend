import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiFileText as FileText, FiTrash2 as Trash2 } from 'react-icons/fi';
import api, { errMsg } from '../../lib/api';
import { Field, Img, Spinner, useFetch } from '../../components/ui';
import { PageHeader, Toggle, fromList, toList } from '../../components/AdminUI';
import { label } from '../../lib/format';
import { useSite } from '../../context/SiteContext';

export default function AdminPanditForm() {
  const { id } = useParams();
  const { meta } = useSite();
  const { weekDays, defaultTimeSlots, documentTypes } = meta.pandit;
  const editing = !!id;
  const navigate = useNavigate();
  const pandit = useFetch(editing ? `/admin/pandits/${id}` : null);
  const pujas = useFetch('/admin/pujas');
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { isActive: true, isVerified: false, experience: 0, priceFrom: 0, availability: { isAvailable: true, days: weekDays, timeSlots: defaultTimeSlots } },
  });
  const [photo, setPhoto] = useState(null);
  const [newDocs, setNewDocs] = useState([]); // [{ file, type }]
  const [removeDocs, setRemoveDocs] = useState([]);

  useEffect(() => {
    const p = pandit.data?.pandit;
    if (!p) return;
    reset({
      ...p, languages: fromList(p.languages), specializations: fromList(p.specializations), services: (p.services || []).map((s) => s._id),
      availability: { isAvailable: p.availability?.isAvailable ?? true, days: p.availability?.days || weekDays, timeSlots: p.availability?.timeSlots || [] },
    });
  }, [pandit.data, reset, weekDays]);

  if (editing && pandit.loading) return <Spinner />;
  const p = pandit.data?.pandit;
  const services = watch('services') || [];
  const days = watch('availability.days') || [];
  const slots = watch('availability.timeSlots') || [];
  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const onSubmit = async (v) => {
    const payload = {
      name: v.name, phone: v.phone, email: v.email, bio: v.bio, city: v.city, state: v.state, location: v.location || [v.city, v.state].filter(Boolean).join(', '),
      experience: Number(v.experience) || 0, priceFrom: Number(v.priceFrom) || 0, languages: toList(v.languages), specializations: toList(v.specializations),
      services, availability: v.availability, isActive: !!v.isActive, isVerified: !!v.isVerified,
      removeDocuments: removeDocs, documentMeta: newDocs.map((d) => ({ type: d.type, name: d.file.name })),
    };
    const fd = new FormData();
    fd.append('data', JSON.stringify(payload));
    if (photo) fd.append('profileImage', photo);
    newDocs.forEach((d) => fd.append('documents', d.file));
    try {
      editing ? await api.put(`/admin/pandits/${id}`, fd) : await api.post('/admin/pandits', fd);
      toast.success(editing ? 'Pandit updated' : 'Pandit created');
      navigate('/admin/pandits');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const openDoc = async (doc) => {
    try {
      const r = await api.get(`/admin/pandits/${id}/documents/${doc._id}`, { responseType: 'blob' });
      window.open(URL.createObjectURL(r.data), '_blank', 'noopener');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <>
      <PageHeader title={editing ? 'Edit Pandit' : 'Add Pandit'} />
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-4xl gap-5">
        <div className="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <Img src={photo ? URL.createObjectURL(photo) : p?.profileImage} alt="" className="h-20 w-20 rounded-full border-2 border-gold-400" />
            <div className="min-w-0"><label className="label">Profile photo</label><input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0] || null)} className="text-sm" /></div>
          </div>
          <Field label="Name *" error={errors.name}><input className="input" {...register('name', { required: 'Name is required' })} /></Field>
          <Field label="Phone"><input className="input" {...register('phone')} /></Field>
          <Field label="Email"><input type="email" className="input" {...register('email')} /></Field>
          <Field label="Experience (years)"><input type="number" min="0" className="input" {...register('experience')} /></Field>
          <Field label="City"><input className="input" {...register('city')} /></Field>
          <Field label="State"><input className="input" {...register('state')} /></Field>
          <Field label="Location / service area" className="sm:col-span-2"><input className="input" placeholder="e.g. Bhubaneswar, Odisha" {...register('location')} /></Field>
          <Field label="Languages (comma separated)"><input className="input" placeholder="Hindi, Sanskrit, Odia" {...register('languages')} /></Field>
          <Field label="Specializations (comma separated)"><input className="input" placeholder="Griha Pravesh, Havan" {...register('specializations')} /></Field>
          <Field label="Price from (₹)"><input type="number" min="0" className="input" {...register('priceFrom')} /></Field>
          <Field label="About" className="sm:col-span-2"><textarea className="input min-h-28" {...register('bio')} /></Field>
        </div>

        <div className="card p-6">
          <h3 className="mb-3 text-lg">Puja services performed</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pujas.data?.items.map((pj) => <Toggle key={pj._id} label={pj.name} checked={services.includes(pj._id)} onChange={() => setValue('services', toggleIn(services, pj._id))} />)}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-3 text-lg">Availability</h3>
          <Toggle label="Currently accepting bookings" checked={watch('availability.isAvailable')} onChange={(v) => setValue('availability.isAvailable', v)} />
          <p className="label mt-4">Days</p>
          <div className="flex flex-wrap gap-2">{weekDays.map((d) => <button type="button" key={d} onClick={() => setValue('availability.days', toggleIn(days, d))} className={`btn btn-sm ${days.includes(d) ? 'bg-maroon-700 text-white' : 'border border-cream-300'}`}>{d}</button>)}</div>
          <p className="label mt-4">Time slots</p>
          <div className="flex flex-wrap gap-2">{meta.timeSlots.map((t) => <button type="button" key={t} onClick={() => setValue('availability.timeSlots', toggleIn(slots, t))} className={`btn btn-sm ${slots.includes(t) ? 'bg-maroon-700 text-white' : 'border border-cream-300'}`}>{t}</button>)}</div>
        </div>

        <div className="card p-6">
          <h3 className="mb-1 text-lg">Verification documents</h3>
          <p className="mb-3 text-xs text-brown-500">Stored privately and visible to admins only.</p>
          {p?.documents?.filter((d) => !removeDocs.includes(d._id)).map((d) => (
            <div key={d._id} className="mb-2 flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2 text-sm">
              <button type="button" onClick={() => openDoc(d)} className="flex items-center gap-2 text-maroon-600"><FileText size={15} /> {d.name} <span className="text-xs text-brown-400">({label(d.type)})</span></button>
              <button type="button" aria-label="Remove document" onClick={() => setRemoveDocs([...removeDocs, d._id])}><Trash2 size={15} className="text-red-600" /></button>
            </div>
          ))}
          {newDocs.map((d, i) => (
            <div key={i} className="mb-2 flex items-center gap-3 rounded-xl bg-saffron-50 px-3 py-2 text-sm">
              <span className="flex-1 truncate">{d.file.name}</span>
              <select className="input w-auto py-1" value={d.type} onChange={(e) => setNewDocs(newDocs.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)))}>{documentTypes.map((v) => <option key={v} value={v}>{label(v)}</option>)}</select>
              <button type="button" aria-label="Remove" onClick={() => setNewDocs(newDocs.filter((_, j) => j !== i))}><Trash2 size={15} className="text-red-600" /></button>
            </div>
          ))}
          <input type="file" accept="image/*,application/pdf" multiple className="mt-2 text-sm" onChange={(e) => { setNewDocs([...newDocs, ...[...e.target.files].map((file) => ({ file, type: 'ID_PROOF' }))]); e.target.value = ''; }} />
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex gap-6"><Toggle label="Verified" checked={watch('isVerified')} onChange={(v) => setValue('isVerified', v)} /><Toggle label="Active (visible on website)" checked={watch('isActive')} onChange={(v) => setValue('isActive', v)} /></div>
          <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={() => navigate('/admin/pandits')}>Cancel</button><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Pandit'}</button></div>
        </div>
      </form>
    </>
  );
}
