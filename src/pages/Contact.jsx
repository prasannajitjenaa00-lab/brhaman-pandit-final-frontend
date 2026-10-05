import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiClock, FiUser, FiSend, FiChevronRight, FiHeadphones, FiShield, FiTruck, FiCreditCard, FiFileText, FiMessageCircle } from 'react-icons/fi';
import { FaOm, FaRegCalendarCheck, FaUsers } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';
import api, { errMsg } from '../lib/api';
import { BannerPhoto, Field } from '../components/ui';
import { useSite } from '../context/SiteContext';
import { EMAIL_RULE } from '../lib/format';

const BANNER = '/contact-banner.jpg'; // replace the file in frontend/public to change the banner photo

// Icons for the quick-help topics; the topics themselves are the backend's contact subjects.
const TOPIC_ICONS = {
  'Puja Services': FaOm, 'Booking Process': FaRegCalendarCheck, 'Order & Delivery': FiTruck,
  'Cancellation Policy': FiFileText, 'Payment Information': FiCreditCard, 'Other Queries': FiMessageCircle,
};

const PROMISES = [
  { icon: FiHeadphones, title: 'Friendly Support', text: 'Our team is always here to help.' },
  { icon: FiShield, title: 'Quick Response', text: 'We respond within 24 hours.' },
  { icon: FaUsers, title: 'Guidance & Assistance', text: 'Get expert suggestions.' },
  { icon: GiLotusFlower, title: 'Your Spiritual Partner', text: 'With you at every step.' },
];

const Ornament = () => <span className="inline-block h-px w-14 bg-gold-500" aria-hidden="true" />;

const IconInput = ({ icon: Icon, children }) => (
  <div className="relative">
    <Icon size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-500" />
    {children}
  </div>
);

export default function Contact() {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: { subject: '' } });
  const [sent, setSent] = useState(false);
  const { settings: s, meta } = useSite();
  const formRef = useRef(null);

  const onSubmit = async (v) => {
    try {
      await api.post('/contact', v);
      setSent(true);
      reset();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const pickTopic = (label) => {
    setValue('subject', label, { shouldValidate: true });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const info = [
    { icon: FiMail, title: s.contactEmail, text: 'We usually respond within 24 hours', href: `mailto:${s.contactEmail}` },
    { icon: FiPhone, title: s.contactPhone, text: s.workingHours, href: `tel:${(s.contactPhone || '').replace(/\s/g, '')}` },
    { icon: FiMapPin, title: s.address, text: 'Serving across major cities' },
    { icon: FiClock, title: 'Response Time', text: 'Within 24 hours' },
  ].filter((row) => row.title);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-[#fdf3df] to-cream-200 pb-24 sm:pb-28">
        <GiLotusFlower className="pointer-events-none absolute -left-16 top-4 h-72 w-72 text-gold-400/10" aria-hidden="true" />
        <BannerPhoto src={BANNER} alt="Brass lamps, incense and marigold flowers" className="h-[17rem] w-[48%]" position="bg-center" fade={35} />
        <div className="container-x relative pt-10 sm:pt-12">
          <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600"><Ornament /> Contact Us <Ornament /></p>
          <h1 className="font-serif text-4xl font-bold leading-[1.05] sm:text-6xl">
            <span className="text-maroon-800">We’d love to hear</span>
            <br />
            <span className="bg-gradient-to-r from-saffron-600 to-gold-600 bg-clip-text text-transparent">from you</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-brown-700">Have questions about a Puja, a booking or an order? Send us a message and our team will get back to you soon.</p>
        </div>
      </section>

      <div className="container-x -mt-16 grid grid-cols-1 gap-6 pb-12 lg:grid-cols-[1.35fr_1fr]">
        {/* form */}
        <div ref={formRef} className="card p-6 sm:p-8">
          <h2 className="mb-5 flex items-center gap-3 text-2xl"><FiMail className="text-maroon-700" /> Send Us a Message</h2>
          {sent ? (
            <div className="py-10 text-center">
              <h3 className="text-2xl">Thank you!</h3>
              <p className="mt-2 text-brown-600">We’ve received your message and emailed you an acknowledgement. We’ll reply shortly.</p>
              <button className="btn-outline mt-6" onClick={() => setSent(false)}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
              <Field label="Full Name *" error={errors.name}>
                <IconInput icon={FiUser}><input className="input pl-10" placeholder="Enter your full name" autoComplete="name" {...register('name', { required: 'Name is required' })} /></IconInput>
              </Field>
              <Field label="Email Address *" error={errors.email}>
                <IconInput icon={FiMail}><input type="email" className="input pl-10" placeholder="Enter your email address" autoComplete="email" {...register('email', EMAIL_RULE)} /></IconInput>
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <IconInput icon={FiPhone}><input className="input pl-10" inputMode="tel" placeholder="Enter your phone number" autoComplete="tel" {...register('phone', { pattern: { value: /^[+]?[0-9\s-]{10,15}$/, message: 'Enter a valid phone number' } })} /></IconInput>
              </Field>
              <Field label="Subject *" error={errors.subject}>
                <select className="input" {...register('subject', { required: 'Please select a subject' })}>
                  <option value="">Select a subject</option>
                  {meta.contactSubjects.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="Message *" error={errors.message} className="sm:col-span-2">
                <textarea className="input min-h-36" maxLength={3000} placeholder="Write your message here..." {...register('message', { required: 'Message is required' })} />
              </Field>
              <div className="sm:col-span-2">
                <button className="btn bg-gradient-to-b from-maroon-600 to-maroon-800 px-8 py-3.5 text-base text-white shadow-lift" disabled={isSubmitting}>
                  <FiSend /> {isSubmitting ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* side column */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="flex items-center gap-3 text-xl"><FiHeadphones className="text-maroon-700" /> Get in Touch</h2>
            <p className="mt-1 text-xs text-brown-500">We’re here to help you with your spiritual journey.</p>
            <ul className="mt-5 space-y-4">
              {info.map(({ icon: Icon, title, text, href }) => (
                <li key={text} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saffron-100/70 text-maroon-600"><Icon size={18} /></span>
                  <div className="min-w-0 text-sm">
                    {href ? <a href={href} className="block truncate font-semibold text-brown-900 hover:text-maroon-600">{title}</a> : <p className="font-semibold text-brown-900">{title}</p>}
                    <p className="text-xs text-brown-500">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-3 text-xl"><FiMessageCircle className="text-maroon-700" /> Frequently Asked Topics</h2>
            <p className="mt-1 text-xs text-brown-500">Quick help for common questions.</p>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {meta.contactSubjects.map((label) => {
                const Icon = TOPIC_ICONS[label] || FiMessageCircle;
                return (
                <button key={label} type="button" onClick={() => pickTopic(label)} className="flex items-center gap-2.5 rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-left text-xs font-medium text-brown-800 transition hover:border-gold-400 hover:shadow-soft">
                  <Icon size={16} className="shrink-0 text-maroon-600" /> <span className="flex-1">{label}</span> <FiChevronRight size={14} className="text-brown-400" />
                </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-brown-500">Need policy details? See our <Link to="/info/faqs" className="font-semibold text-maroon-600 hover:underline">FAQs</Link>.</p>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-r from-maroon-50 via-cream-50 to-maroon-50 py-8">
        <ul className="container-x grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="text-saffron-600"><Icon size={30} /></span>
              <span className="text-sm"><span className="block font-semibold text-brown-900">{title}</span><span className="text-xs text-brown-500">{text}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
