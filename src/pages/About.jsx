import { Link } from 'react-router-dom';
import { FiShield, FiUsers, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import { FaLeaf, FaHandHoldingHeart } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';
import { MdOutlineWorkspaces } from 'react-icons/md';
import { BannerPhoto } from '../components/ui';

const BANNER = '/about-banner.jpg'; // replace the file in frontend/public to change the banner photo

const HERO_POINTS = [
  { icon: GiLotusFlower, lines: ['Authentic', 'Traditions'] },
  { icon: FiUsers, lines: ['Verified', 'Pandits'] },
  { icon: MdOutlineWorkspaces, lines: ['Complete', 'Puja Solutions'] },
];

const VALUES = [
  { icon: FiShield, title: 'Trust First', text: 'Pandits are verified by our team before they are listed.' },
  { icon: FaLeaf, title: 'Authenticity', text: 'Samagri sourced with care so your Puja is complete and pure.' },
  { icon: FiUsers, title: 'For Every Family', text: 'From a small Ganesh Puja at home to a full wedding ceremony.' },
  { icon: FaHandHoldingHeart, title: 'Honest Service', text: 'Clear pricing, clear communication, no surprises.' },
];

const Ornament = () => (
  <svg width="70" height="12" viewBox="0 0 70 12" aria-hidden="true">
    <path d="M0 6h26M44 6h26" stroke="#d9a441" strokeWidth="1" />
    <path d="M35 1l5 5-5 5-5-5z" fill="none" stroke="#d9a441" strokeWidth="1.2" />
  </svg>
);

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-[#fdf3df] to-cream-200">
        <GiLotusFlower className="pointer-events-none absolute -left-20 top-4 h-80 w-80 text-gold-400/10" aria-hidden="true" />
        <BannerPhoto src={BANNER} alt="A Pandit seated before brass lamps, flowers and a temple tower" className="w-[52%]" fade={30} />
        <div className="container-x relative py-12 sm:py-16">
          <div className="max-w-xl">
            <p className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600">About Us <Ornament /></p>
            <h1 className="font-serif text-5xl font-bold leading-[1.05] sm:text-6xl">
              <span className="text-maroon-800">Divine Traditions,</span>
              <br />
              <span className="bg-gradient-to-r from-saffron-600 to-gold-600 bg-clip-text text-transparent">Trusted Pandits.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-brown-700">
              Brahmam Pandit is a modern Indian spiritual marketplace that makes it simple to book experienced Pandits for your Puja ceremonies and to shop authentic Puja Samagri — all in one place.
            </p>
            <ul className="mt-8 flex flex-wrap items-center gap-y-4">
              {HERO_POINTS.map(({ icon: Icon, lines }, i) => (
                <li key={lines[0]} className={`flex items-center gap-3 pr-6 ${i < HERO_POINTS.length - 1 ? 'mr-6 border-r border-gold-400/50' : ''}`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-saffron-100/70 text-saffron-600"><Icon size={22} /></span>
                  <span className="font-serif text-base leading-tight text-maroon-800">{lines[0]}<br />{lines[1]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* mobile/tablet: photo below the text */}
        <div className="h-56 bg-cover bg-center sm:h-72 lg:hidden" style={{ backgroundImage: `url(${BANNER})` }} role="img" aria-label="A Pandit seated before brass lamps" />
      </section>

      <section className="relative py-14 sm:py-16">
        <div className="container-x relative">
          <div className="mb-10 text-center">
            <p className="mb-2 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-saffron-600"><Ornament /> What we believe <Ornament /></p>
            <h2 className="font-serif text-4xl font-bold text-maroon-800">Tradition, made effortless</h2>
            <p className="mx-auto mt-3 max-w-xl text-brown-600">We bring authentic rituals, trusted Pandits and genuine Puja Samagri closer to every home with simplicity and trust.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron-100/70 text-maroon-700"><Icon size={26} /></span>
                <h3 className="mt-5 text-xl">{title}</h3>
                <p className="mt-1.5 text-sm text-brown-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/pandits" className="btn bg-gradient-to-b from-maroon-600 to-maroon-800 px-7 py-3.5 text-base text-white shadow-lift">Book a Pandit <FiArrowRight /></Link>
            <Link to="/shop" className="btn border border-maroon-600 bg-white/60 px-7 py-3.5 text-base text-maroon-700 hover:bg-white"><FiShoppingCart /> Shop Samagri</Link>
          </div>
        </div>
      </section>
    </>
  );
}
