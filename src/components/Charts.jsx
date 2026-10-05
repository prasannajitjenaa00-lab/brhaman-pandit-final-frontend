import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '../lib/format';

const C = { maroon: '#7b1e3a', saffron: '#e48a12', gold: '#b8862b', grid: '#ead7b3', text: '#8a6d5a' };

const Card = ({ title, children, empty }) => (
  <div className="card p-5">
    <h3 className="mb-4 font-sans text-sm font-semibold text-brown-700">{title}</h3>
    <div className="h-64">{empty ? <p className="flex h-full items-center justify-center text-sm text-brown-400">No data for this period</p> : children}</div>
  </div>
);

const axis = { stroke: C.text, fontSize: 11, tickLine: false };

export function TrendChart({ title, data, dataKey = 'count', color = C.maroon, currency = false }) {
  return (
    <Card title={title} empty={!data?.length}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -10, right: 8, top: 4 }}>
          <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" {...axis} tickFormatter={(d) => d.slice(-5)} />
          <YAxis {...axis} allowDecimals={false} width={currency ? 52 : 36} tickFormatter={currency ? (v) => (v >= 1000 ? `${v / 1000}k` : v) : undefined} />
          <Tooltip formatter={(v) => (currency ? money(v) : v)} contentStyle={{ borderRadius: 12, border: '1px solid #ead7b3' }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function RankChart({ title, data, color = C.saffron }) {
  return (
    <Card title={title} empty={!data?.length}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid stroke={C.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" {...axis} allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} {...axis} tickFormatter={(n) => (n.length > 18 ? `${n.slice(0, 17)}…` : n)} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ead7b3' }} />
          <Bar dataKey="count" fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ChartGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TrendChart title="Booking trends" data={stats.bookingTrend} />
      <TrendChart title="Order trends" data={stats.orderTrend} color={C.saffron} />
      <TrendChart title="Revenue trends" data={stats.revenueTrend} dataKey="amount" color={C.gold} currency />
      <RankChart title="Popular Puja services" data={stats.popularPujas} />
      <RankChart title="Popular products" data={stats.popularProducts} color={C.maroon} />
    </div>
  );
}
