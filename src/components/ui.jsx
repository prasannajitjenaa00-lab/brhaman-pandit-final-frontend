import { useCallback, useEffect, useState } from 'react';
import { GiLotusFlower as Flower2 } from 'react-icons/gi';
import { FiLoader as Loader2, FiStar as Star, FiX as X, FiChevronLeft as ChevronLeft, FiChevronRight as ChevronRight, FiBox as PackageOpen, FiGrid as Grid, FiList as List } from 'react-icons/fi';
import api from '../lib/api';
import { assetUrl } from '../lib/config';
import { label, statusColor } from '../lib/format';

export const Spinner = ({ className = '' }) => (
  <div className={`flex justify-center py-16 ${className}`}>
    <Loader2 className="h-8 w-8 animate-spin text-maroon-600" />
  </div>
);

export const StatusBadge = ({ status }) => <span className={`badge ${statusColor(status)}`}>{label(status)}</span>;

export const Stars = ({ value = 0, count, size = 14 }) => (
  <span className="inline-flex items-center gap-1 text-sm text-brown-500">
    <Star size={size} className="fill-gold-500 text-gold-500" />
    <span className="font-semibold text-brown-800">{value ? Number(value).toFixed(1) : 'New'}</span>
    {count !== undefined && value > 0 && <span>({count})</span>}
  </span>
);

export const StarInput = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button type="button" key={n} onClick={() => onChange(n)} aria-label={`${n} stars`}>
        <Star size={26} className={n <= value ? 'fill-gold-500 text-gold-500' : 'text-cream-300'} />
      </button>
    ))}
  </div>
);

// Shows the image when present; otherwise a tasteful placeholder so real images can be dropped in later.
export const Img = ({ src, alt, className = '', icon: Icon = Flower2 }) =>
  src ? (
    <img src={assetUrl(src)} alt={alt} loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center bg-gradient-to-br from-saffron-50 via-cream-100 to-maroon-50 ${className}`} role="img" aria-label={alt}>
      <Icon className="h-1/3 w-1/3 max-h-16 max-w-16 text-gold-500/70" strokeWidth={1.2} />
    </div>
  );

export const SectionTitle = ({ eyebrow, title, subtitle, center = true }) => (
  <div className={`mb-10 ${center ? 'text-center' : ''}`}>
    {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
    <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
    {subtitle && <p className={`mt-3 max-w-2xl text-brown-500 ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
  </div>
);

export const Empty = ({ title = 'Nothing here yet', text, action }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    <PackageOpen className="mb-3 h-10 w-10 text-gold-500" strokeWidth={1.3} />
    <h3 className="text-lg">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-brown-500">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// Prev/Next pager; pass `numbered` for the numbered variant used on public listing pages.
export const Pagination = ({ page, pages, onChange, numbered = false }) => {
  if (!(pages > 1)) return null;
  if (!numbered) {
    return (
      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
        <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="text-brown-500">
          Page {page} of {pages}
        </span>
        <button className="btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    );
  }
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm" aria-label="Pagination">
      <button className="btn border border-cream-300 bg-white px-4 py-2 text-brown-600" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={14} /> Previous
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-brown-400">…</span>}
          <button onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined} className={`h-9 w-9 rounded-full font-semibold ${n === page ? 'bg-maroon-700 text-white' : 'border border-cream-300 bg-white text-brown-700 hover:border-gold-400'}`}>
            {n}
          </button>
        </span>
      ))}
      <button className="btn border border-cream-300 bg-white px-4 py-2 text-maroon-700" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight size={14} />
      </button>
    </nav>
  );
};

// Two-handle price slider. `value` is [min, max]; onChange fires while dragging, onCommit on release.
export const PriceRangeSlider = ({ min, max, step = 100, value, onChange, onCommit }) => {
  const span = Math.max(1, max - min);
  const pct = (v) => ((v - min) / span) * 100;
  return (
    <div>
      <div className="dual-range" onPointerUp={onCommit} onKeyUp={onCommit}>
        <div className="dual-track"><div className="dual-fill" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }} /></div>
        <input type="range" min={min} max={max} step={step} value={value[0]} aria-label="Minimum price" onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - step), value[1]])} />
        <input type="range" min={min} max={max} step={step} value={value[1]} aria-label="Maximum price" onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + step)])} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-brown-600">
        <span>₹{value[0].toLocaleString('en-IN')}</span>
        <span>₹{value[1].toLocaleString('en-IN')}{value[1] >= max && '+'}</span>
      </div>
    </div>
  );
};

// Grid / list layout switch used by listing pages.
export const ViewToggle = ({ value, onChange }) => (
  <div className="flex overflow-hidden rounded-lg border border-cream-300" role="group" aria-label="Layout">
    {[['grid', Grid, 'Grid view'], ['list', List, 'List view']].map(([key, Icon, text]) => (
      <button key={key} className={`p-2.5 ${value === key ? 'bg-maroon-700 text-white' : 'bg-white text-brown-600'}`} onClick={() => onChange(key)} aria-label={text} aria-pressed={value === key}>
        <Icon size={16} />
      </button>
    ))}
  </div>
);

// Right-aligned hero photo that fades into the page background (desktop only; each page also renders
// a stacked mobile image where needed). Photos live in /public and are swappable without code changes.
export const BannerPhoto = ({ src, alt, className = 'w-1/2', fade = 35, breakpoint = 'lg:block', position = 'bg-right' }) => {
  const mask = `linear-gradient(to right, transparent 0%, #000 ${fade}%)`;
  return (
    <div
      className={`absolute inset-y-0 right-0 hidden bg-cover ${position} ${breakpoint} ${className}`}
      style={{ backgroundImage: `url(${src})`, WebkitMaskImage: mask, maskImage: mask }}
      role="img"
      aria-label={alt}
    />
  );
};

export const Modal = ({ open, onClose, title, children, wide }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-maroon-900/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-cream-100">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Form field wrapper used with react-hook-form
export const Field = ({ label: text, error, children, className = '' }) => (
  <div className={className}>
    {text && <label className="label">{text}</label>}
    {children}
    {error && <p className="field-error">{error.message}</p>}
  </div>
);

// Minimal data hook: { data, loading, error, reload }
export function useFetch(url, params, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = JSON.stringify(params || {});
  const load = useCallback(() => {
    if (!url) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(url, { params })
      .then((r) => setState({ data: r.data, loading: false, error: null }))
      .catch((e) => setState({ data: null, loading: false, error: e?.response?.data?.message || 'Failed to load' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key, ...deps]);
  useEffect(load, [load]);
  return { ...state, reload: load };
}

export const ErrorBox = ({ message }) => <div className="card border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{message}</div>;
