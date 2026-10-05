export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const fmtDate = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-IN', opts) : '—';

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const label = (s) => String(s || '').replace(/_/g, ' ').toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

const COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  RESCHEDULED: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
  PLACED: 'bg-amber-100 text-amber-800',
  PROCESSING: 'bg-sky-100 text-sky-800',
  PACKED: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-violet-100 text-violet-800',
  OUT_FOR_DELIVERY: 'bg-fuchsia-100 text-fuchsia-800',
  DELIVERED: 'bg-green-100 text-green-800',
  PAID: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  COD: 'bg-slate-100 text-slate-700',
  NOT_REQUIRED: 'bg-slate-100 text-slate-700',
  'IN STOCK': 'bg-green-100 text-green-800',
  'LOW STOCK': 'bg-amber-100 text-amber-800',
  'OUT OF STOCK': 'bg-red-100 text-red-700',
  APPROVED: 'bg-green-100 text-green-800',
  HIDDEN: 'bg-slate-200 text-slate-700',
  NEW: 'bg-amber-100 text-amber-800',
  READ: 'bg-sky-100 text-sky-800',
  RESOLVED: 'bg-green-100 text-green-800',
};
export const statusColor = (s) => COLORS[s] || 'bg-slate-100 text-slate-700';


export const PHONE_RULE = { required: 'Phone is required', pattern: { value: /^[+]?[0-9\s-]{10,15}$/, message: 'Enter a valid phone number' } };
export const EMAIL_RULE = { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } };
export const PIN_RULE = { required: 'Pincode is required', pattern: { value: /^[0-9]{6}$/, message: 'Enter a 6-digit pincode' } };
export const PASSWORD_RULE = { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } };
