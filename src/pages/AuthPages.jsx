import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GiCandleFlame as Flame } from 'react-icons/gi';
import api, { errMsg } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/ui';
import { EMAIL_RULE, PASSWORD_RULE } from '../lib/format';

const Shell = ({ title, subtitle, children, footer }) => (
  <div className="motif flex min-h-[70vh] items-center justify-center px-4 py-12">
    <div className="card w-full max-w-md p-7 sm:p-9">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon-700"><Flame className="text-gold-400" /></span>
      <h1 className="text-center text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-center text-sm text-brown-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
      {footer && <p className="mt-6 text-center text-sm text-brown-500">{footer}</p>}
    </div>
  </div>
);

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const dest = state?.from || '/dashboard';
  if (user) return <Navigate to={user.role === 'ADMIN' && !state?.from ? '/admin' : dest} replace />;

  const onSubmit = async (v) => {
    try {
      const u = await login(v.email, v.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      navigate(u.role === 'ADMIN' && !state?.from ? '/admin' : dest, { replace: true });
    } catch (e) {
      if (e.response?.data?.needsVerification) {
        toast(e.response.data.message);
        return navigate('/verify-email', { state: { email: e.response.data.email, from: state?.from } });
      }
      toast.error(errMsg(e));
    }
  };

  return (
    <Shell title="Welcome back" subtitle="Log in to manage your bookings and orders" footer={<>New here? <Link to="/register" state={state} className="font-semibold text-maroon-600">Create an account</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" error={errors.email}><input type="email" autoComplete="email" className="input" {...register('email', EMAIL_RULE)} /></Field>
        <Field label="Password" error={errors.password}><input type="password" autoComplete="current-password" className="input" {...register('password', { required: 'Password is required' })} /></Field>
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-maroon-600">Forgot password?</Link></div>
        <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Login'}</button>
      </form>
    </Shell>
  );
}

export function Register() {
  const { user, register: signup } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  if (user) return <Navigate to={state?.from || '/dashboard'} replace />;

  const onSubmit = async ({ confirm: _confirm, ...v }) => {
    try {
      const r = await signup(v);
      toast.success(r.message);
      navigate('/verify-email', { state: { email: r.email, from: state?.from } });
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <Shell title="Create your account" subtitle="Book Pandits and shop Puja Samagri" footer={<>Already have an account? <Link to="/login" state={state} className="font-semibold text-maroon-600">Login</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.name}><input className="input" autoComplete="name" {...register('name', { required: 'Name is required' })} /></Field>
        <Field label="Email" error={errors.email}><input type="email" autoComplete="email" className="input" {...register('email', EMAIL_RULE)} /></Field>
        <Field label="Phone" error={errors.phone}><input className="input" inputMode="tel" autoComplete="tel" {...register('phone', { pattern: { value: /^[+]?[0-9\s-]{10,15}$/, message: 'Enter a valid phone number' } })} /></Field>
        <Field label="Password" error={errors.password}><input type="password" autoComplete="new-password" className="input" {...register('password', PASSWORD_RULE)} /></Field>
        <Field label="Confirm password" error={errors.confirm}><input type="password" autoComplete="new-password" className="input" {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })} /></Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create account'}</button>
      </form>
    </Shell>
  );
}

export function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);
  const onSubmit = async (v) => {
    try {
      await api.post('/auth/forgot-password', v);
      setSent(true);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <Shell title="Forgot password" subtitle="We’ll email you a reset link" footer={<Link to="/login" className="font-semibold text-maroon-600">Back to login</Link>}>
      {sent ? <p className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-800">If an account exists for that email, a reset link is on its way. It is valid for 30 minutes.</p> : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email" error={errors.email}><input type="email" className="input" {...register('email', EMAIL_RULE)} /></Field>
          <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
    </Shell>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const onSubmit = async (v) => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password: v.password });
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <Shell title="Reset password" subtitle="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="New password" error={errors.password}><input type="password" autoComplete="new-password" className="input" {...register('password', PASSWORD_RULE)} /></Field>
        <Field label="Confirm password" error={errors.confirm}><input type="password" autoComplete="new-password" className="input" {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })} /></Field>
        <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Reset password'}</button>
      </form>
    </Shell>
  );
}

const RESEND_SECONDS = 60;

export function VerifyEmail() {
  const { user, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const input = useRef(null);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  if (user) return <Navigate to={state?.from || '/dashboard'} replace />;
  if (!email) return <Navigate to="/register" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error('Enter the 6-digit code');
    setBusy(true);
    try {
      const u = await verifyOtp(email, code);
      toast.success(`Welcome, ${u.name.split(' ')[0]}! Your email is verified.`);
      navigate(state?.from || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
      setCode('');
      input.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('A new code is on its way');
      setWait(RESEND_SECONDS);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <Shell title="Verify your email" subtitle={`Enter the 6-digit code we sent to ${email}`} footer={<>Wrong email? <Link to="/register" className="font-semibold text-maroon-600">Start again</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <input
          ref={input}
          autoFocus
          className="input text-center font-mono text-2xl tracking-[0.5em]"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          aria-label="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <button className="btn-primary w-full" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify & continue'}</button>
        <p className="text-center text-sm text-brown-500">
          Didn’t get it?{' '}
          {wait > 0 ? <span>Resend in {wait}s</span> : <button type="button" onClick={resend} className="font-semibold text-maroon-600">Resend code</button>}
        </p>
        <p className="text-center text-xs text-brown-400">The code expires in 10 minutes. Check your spam folder too.</p>
      </form>
    </Shell>
  );
}
