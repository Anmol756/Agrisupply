/**
 * Main Dashboard — overview with KPI metrics, charts, and recent activity.
 * Structured in clear sections: Metrics → Analytics → Activity
 */

import { useState, useEffect } from 'react';
import { Users, Package, Warehouse, Truck, Thermometer, AlertTriangle, Activity } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import api from '../api/client';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';

const PIE_COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

const TOOLTIP_STYLE = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#f1f5f9',
  padding: '8px 12px',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [tempTrends, setTempTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, catRes, whRes, shipRes, tempRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/product-categories'),
        api.get('/api/dashboard/warehouse-utilization'),
        api.get('/api/dashboard/recent-shipments'),
        api.get('/api/dashboard/temperature-trends'),
      ]);
      setStats(statsRes.data);
      setCategories(catRes.data);
      setWarehouseData(whRes.data);
      setRecentShipments(shipRes.data);
      setTempTrends(tempRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-[3px] border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading dashboard…</p>
      </div>
    );
  }

  const utilPct = stats?.warehouse_utilization?.utilization_percent ?? 0;
  const shipTotal = stats?.shipments ?? 0;

  const shipmentBreakdown = [
    { label: 'Pending',    value: stats?.shipment_status?.pending    ?? 0, color: '#f59e0b', track: '#fef3c7' },
    { label: 'In Transit', value: stats?.shipment_status?.in_transit ?? 0, color: '#3b82f6', track: '#dbeafe' },
    { label: 'Delivered',  value: stats?.shipment_status?.delivered  ?? 0, color: '#16a34a', track: '#dcfce7' },
  ];

  return (
    <div className="space-y-7">

      {/* ── Section 1: Key Metrics ── */}
      <section>
        <p className="section-title mb-3">Key Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Farmers"   value={stats?.farmers   ?? 0} icon={Users}         color="#16a34a" trend="up" trendValue="+12%" delay={0}   />
          <StatCard title="Products"        value={stats?.products  ?? 0} icon={Package}       color="#d97706" trend="up" trendValue="+8%"  delay={60}  />
          <StatCard title="Warehouses"      value={stats?.warehouses ?? 0} icon={Warehouse}     color="#2563eb" delay={120} />
          <StatCard title="Shipments"       value={stats?.shipments ?? 0} icon={Truck}         color="#7c3aed" delay={180} />
          <StatCard title="Vehicles"        value={stats?.transports ?? 0} icon={Truck}         color="#0891b2" delay={240} />
          <StatCard title="Active Alerts"   value={stats?.alerts    ?? 0} icon={AlertTriangle}  color="#dc2626"
            trend={stats?.alerts > 0 ? 'down' : undefined} trendValue="Active" delay={300} />
        </div>
      </section>

      {/* ── Section 2: Analytics Charts ── */}
      <section>
        <p className="section-title mb-3">Analytics</p>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Warehouse Utilization Bar Chart — 3 cols */}
          <div className="card p-5 lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <div>
                <h3 className="section-heading">Warehouse Utilization</h3>
                <p className="section-sub">Capacity vs. current load across all facilities</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={warehouseData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  angle={-20} textAnchor="end" height={55}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                  width={36}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f0fdf4' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Bar dataKey="capacity"  fill="#bbf7d0" name="Capacity (tons)"      radius={[5,5,0,0]} />
                <Bar dataKey="load"      fill="#16a34a" name="Current Load (tons)"  radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Distribution Pie Chart — 2 cols */}
          <div className="card p-5 lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <div className="section-header">
              <div>
                <h3 className="section-heading">Product Mix</h3>
                <p className="section-sub">Distribution by category</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%" cy="50%"
                  outerRadius={90} innerRadius={48}
                  paddingAngle={3}
                  label={({ category, percent }) =>
                    `${category} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categories.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {categories.map((c, idx) => (
                <div key={c.category} className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{c.category}</span>
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 ml-auto flex-shrink-0">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Temperature & Shipment Status ── */}
      <section>
        <p className="section-title mb-3">Monitoring</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Temperature Area Chart — 2 cols */}
          <div className="card p-5 lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="section-header mb-4">
              <div>
                <h3 className="section-heading">Temperature Trend</h3>
                <p className="section-sub">Last 50 sensor readings across all warehouses</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                Alert zone
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={tempTrends}>
                <defs>
                  <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gHumid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="id" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="°" width={32} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v, name) => [
                    name === 'temperature' ? `${v}°C` : `${v}%`,
                    name === 'temperature' ? 'Temperature' : 'Humidity',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="temperature" stroke="#16a34a" strokeWidth={2}
                  fill="url(#gTemp)"  name="Temperature (°C)" dot={false} />
                <Area type="monotone" dataKey="humidity"    stroke="#3b82f6" strokeWidth={1.5}
                  fill="url(#gHumid)" name="Humidity (%)"    dot={false} opacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Shipment Status + Warehouse Utilization Summary — 1 col */}
          <div className="card p-5 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <h3 className="section-heading mb-1">Shipment Status</h3>
            <p className="section-sub mb-5">Current pipeline overview</p>

            <div className="space-y-4">
              {shipmentBreakdown.map((item) => {
                const pct = shipTotal > 0 ? Math.round((item.value / shipTotal) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                        <span className="text-xs text-gray-400">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: item.track }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Warehouse Utilization Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Warehouse Capacity</h4>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{utilPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${utilPct}%`,
                    background: utilPct > 85
                      ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                      : utilPct > 65
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #16a34a, #22c55e)',
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {stats?.warehouse_utilization?.total_load_tons ?? 0} / {stats?.warehouse_utilization?.total_capacity_tons ?? 0} tons in use
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Recent Shipments ── */}
      <section>
        <p className="section-title mb-3">Recent Activity</p>
        <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="section-heading">Recent Shipments</h3>
              <p className="section-sub">Last 10 shipment records</p>
            </div>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold text-gray-900 dark:text-white">#{s.id}</td>
                    <td>{s.origin || '—'}</td>
                    <td>{s.destination || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="text-gray-400 text-xs">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
                {recentShipments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">No shipments recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
