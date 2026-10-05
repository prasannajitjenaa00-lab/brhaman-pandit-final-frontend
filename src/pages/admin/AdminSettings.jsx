import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../lib/api';
import { Field, Spinner, useFetch } from '../../components/ui';
import { PageHeader } from '../../components/AdminUI';

export default function AdminSettings() {
  const { data, loading } = useFetch('/admin/settings');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  useEffect(() => { if (data) reset(data.settings); }, [data, reset]);
  if (loading) return <Spinner />;
  const onSubmit = async (v) => {
    try {
      await api.put('/admin/settings', { siteName: v.siteName, contactEmail: v.contactEmail, contactPhone: v.contactPhone, address: v.address, workingHours: v.workingHours, facebook: v.facebook, instagram: v.instagram, youtube: v.youtube, whatsapp: v.whatsapp, deliveryCharge: Number(v.deliveryCharge) || 0, freeDeliveryAbove: Number(v.freeDeliveryAbove) || 0 });
      toast.success('Settings saved');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <>
      <PageHeader title="Settings" />
      <form onSubmit={handleSubmit(onSubmit)} className="card grid grid-cols-1 max-w-2xl gap-4 p-6 sm:grid-cols-2">
        <Field label="Site name" className="sm:col-span-2"><input className="input" {...register('siteName')} /></Field>
        <Field label="Contact email"><input type="email" className="input" {...register('contactEmail')} /></Field>
        <Field label="Contact phone"><input className="input" {...register('contactPhone')} /></Field>
        <Field label="Address" className="sm:col-span-2"><input className="input" {...register('address')} /></Field>
        <Field label="Working hours" className="sm:col-span-2"><input className="input" placeholder="Mon - Sat, 9:00 AM - 7:00 PM" {...register('workingHours')} /></Field>
        <Field label="Facebook URL"><input className="input" placeholder="https://facebook.com/…" {...register('facebook')} /></Field>
        <Field label="Instagram URL"><input className="input" placeholder="https://instagram.com/…" {...register('instagram')} /></Field>
        <Field label="YouTube URL"><input className="input" placeholder="https://youtube.com/…" {...register('youtube')} /></Field>
        <Field label="WhatsApp link"><input className="input" placeholder="https://wa.me/91…" {...register('whatsapp')} /></Field>
        <Field label="Delivery charge (₹)"><input type="number" min="0" className="input" {...register('deliveryCharge')} /></Field>
        <Field label="Free delivery above (₹)"><input type="number" min="0" className="input" {...register('freeDeliveryAbove')} /></Field>
        <div className="sm:col-span-2"><button className="btn-primary" disabled={isSubmitting}>Save settings</button></div>
        <p className="text-xs text-brown-500 sm:col-span-2">SMTP, admin notification email and Cloudinary credentials are configured on the server in <code>.env</code> and are never exposed to the browser.</p>
      </form>
    </>
  );
}
