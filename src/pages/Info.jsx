import { Link, useParams } from 'react-router-dom';
import NotFound from './NotFound';

// Starter policy text. Have it reviewed (and edit it here) before launch.
const PAGES = {
  faqs: {
    title: 'Frequently Asked Questions',
    sections: [
      ['How do I book a Pandit?', 'Choose a Puja or a Pandit, pick a date and time, enter your address and submit the booking request. Our team confirms it and emails you.'],
      ['Do I need to pay online?', 'No. Pandit bookings are requests that our team confirms, and Puja Samagri orders are Cash on Delivery / Pay Later.'],
      ['Can I change or cancel a booking?', 'Yes — open the booking in your dashboard and request a reschedule or cancellation. Our team will confirm it.'],
      ['How long does delivery take?', 'Delivery time depends on your location. You can track every order step by step from your dashboard.'],
    ],
  },
  'booking-policy': {
    title: 'Booking Policy',
    sections: [
      ['Booking requests', 'A booking is a request until our team confirms it by email. We assign a verified Pandit and confirm the date and time with you.'],
      ['Availability', 'Pandits can be booked only for slots they are available. If your chosen slot is taken, we will suggest another.'],
      ['Charges', 'The estimated amount is shown at booking. The final amount and payment method are confirmed by our team.'],
    ],
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    sections: [
      ['Cancelling a booking', 'You can request cancellation from your dashboard. Cancellation is confirmed by our team.'],
      ['Rescheduling', 'You can request a new date or time. Our team will confirm it subject to Pandit availability.'],
      ['Orders', 'Orders can be cancelled by our team before they are shipped. Contact us as early as possible.'],
    ],
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    sections: [
      ['Delivery charges', 'A small delivery charge applies on smaller orders. Orders above the free-delivery amount ship free.'],
      ['Tracking', 'Order status is updated at each stage, and you receive an email when it is confirmed, shipped and delivered.'],
      ['Payment on delivery', 'Pay in cash when your order arrives.'],
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Your name, contact details, address and booking or order details, used only to provide our services.'],
      ['How we protect it', 'Passwords are stored securely hashed, and we never share your details for marketing without consent.'],
      ['Your choices', 'You can update your profile and addresses anytime, or contact us to request deletion of your account.'],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      ['Using the service', 'By using Brahmam Pandit you agree to provide accurate information and to use the service lawfully.'],
      ['Bookings and orders', 'Bookings are subject to confirmation and Pandit availability. Orders are subject to stock availability.'],
      ['Changes', 'We may update these terms from time to time. Continued use means you accept the updated terms.'],
    ],
  },
};

export default function Info() {
  const { slug } = useParams();
  const page = PAGES[slug];
  if (!page) return <NotFound />;
  return (
    <div className="container-x max-w-3xl py-14">
      <p className="eyebrow mb-2">Information</p>
      <h1 className="font-serif text-4xl font-bold">{page.title}</h1>
      <div className="mt-8 space-y-6">
        {page.sections.map(([h, t]) => (
          <section key={h} className="card p-6"><h2 className="text-xl">{h}</h2><p className="mt-2 text-brown-600">{t}</p></section>
        ))}
      </div>
      <p className="mt-8 text-sm text-brown-500">Questions? <Link to="/contact" className="font-semibold text-maroon-600">Contact us</Link>.</p>
    </div>
  );
}
