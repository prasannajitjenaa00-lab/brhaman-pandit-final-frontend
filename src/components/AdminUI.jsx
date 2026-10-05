import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch as Search } from 'react-icons/fi';
import { Empty, ErrorBox, Pagination, Spinner, useFetch } from './ui';

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-brown-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SearchBox = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative max-w-full">
    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-400" />
    <input className="input w-full min-w-0 pl-9 sm:w-56" placeholder={placeholder} defaultValue={value} onKeyDown={(e) => e.key === 'Enter' && onChange(e.target.value.trim())} onBlur={(e) => e.target.value.trim() !== value && onChange(e.target.value.trim())} />
  </div>
);

// Server-paged list with filters: const list = useList('/admin/users')
export function useList(url, initial = {}, limit = 15) {
  const [filters, setFilters] = useState(initial);
  const [page, setPage] = useState(1);
  const res = useFetch(url, { ...filters, page, limit });
  const set = (k, v) => {
    setFilters((f) => ({ ...f, [k]: v || undefined }));
    setPage(1);
  };
  return { ...res, filters, set, page, setPage };
}

export function DataTable({ columns, list, empty = 'No records found', rowKey = '_id' }) {
  const { data, loading, error, setPage } = list;
  if (error) return <ErrorBox message={error} />;
  return (
    <>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-cream-200 bg-cream-50">
            <tr>{columns.map((c) => <th key={c.header} className="th">{c.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {data?.items.map((row) => (
              <tr key={row[rowKey]} className="hover:bg-cream-50/70">
                {columns.map((c) => <td key={c.header} className={`td ${c.className || ''}`}>{c.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <Spinner className="py-8" />}
        {!loading && data?.items.length === 0 && <div className="p-4"><Empty title={empty} /></div>}
      </div>
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </>
  );
}

export const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <select className="input w-auto" value={value || ''} onChange={(e) => onChange(e.target.value)} aria-label={placeholder}>
    <option value="">{placeholder}</option>
    {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o.replace(/_/g, ' ')}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
  </select>
);

export const ActiveBadge = ({ active }) => (
  <span className={`badge ${active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>{active ? 'Active' : 'Inactive'}</span>
);

export const ViewLink = ({ to, children = 'View' }) => <Link to={to} className="btn-outline btn-sm">{children}</Link>;

// Comma-separated text <-> array helpers for list fields in forms
export const toList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
export const fromList = (a) => (a || []).join(', ');

export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm">
    <input type="checkbox" className="h-4 w-4 accent-maroon-600" checked={!!checked} onChange={(e) => onChange(e.target.checked)} /> {label}
  </label>
);
