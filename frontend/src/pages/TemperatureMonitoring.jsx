/**
 * Temperature Monitoring Dashboard — real-time-style temperature chart,
 * alert highlights, and alert history table.
 */

import { useState, useEffect } from 'react';
import { Thermometer, AlertTriangle, Snowflake, Droplets, Loader2, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import api from '../api/client';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';

export default function TemperatureMonitoring() {
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [alertOnly, setAlertOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ total: 0, alerts: 0, avgTemp: 0, avgHumidity: 0 });

  useEffect(() => { loadWarehouses(); loadChart(); }, []);
  useEffect(() => { loadLogs(); }, [page, warehouseFilter, alertOnly]);

  const loadWarehouses = async () => {
    try {
      const res = await api.get('/api/warehouses/', { params: { limit: 100 } });
      setWarehouses(res.data.items);
    } catch (err) { console.error(err); }
  };

  const loadChart = async () => {
    try {
      const res = await api.get('/api/dashboard/temperature-trends');
      const data = res.data.map((d, i) => ({
        ...d,
        index: i + 1,
        time: d.recorded_at ? new Date(d.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : i,
      }));
      setChartData(data);

      // Calculate stats
      if (data.length > 0) {
        const temps = data.map(d => d.temperature);
        const humids = data.filter(d => d.humidity != null).map(d => d.humidity);
        setStats({
          total: data.length,
          alerts: data.filter(d => d.alert).length,
          avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
          avgHumidity: humids.length > 0 ? (humids.reduce((a, b) => a + b, 0) / humids.length).toFixed(1) : 0,
        });
      }
    } catch (err) { console.error(err); }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page, limit: 15,
        warehouse_id: warehouseFilter || undefined,
        alert_only: alertOnly || undefined,
      };
      const res = await api.get('/api/temperature-logs/', { params });
      setLogs(res.data.items);
      setMeta({ total: res.data.total, pages: res.data.pages });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Custom dot that highlights alerts in red
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.alert) {
      return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div>
        <p className="section-title mb-3">At a Glance</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Readings"    value={stats.total}               icon={Thermometer}   color="#2563eb" delay={0} />
          <StatCard title="Temperature Alerts" value={stats.alerts}              icon={AlertTriangle}  color="#dc2626"
            trend={stats.alerts > 0 ? 'down' : undefined} trendValue="Active" delay={50} />
          <StatCard title="Avg Temperature"   value={`${stats.avgTemp}°C`}      icon={Snowflake}     color="#16a34a" delay={100} />
          <StatCard title="Avg Humidity"      value={`${stats.avgHumidity}%`}   icon={Droplets}      color="#0891b2" delay={150} />
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="card p-5 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <div className="section-header mb-4">
          <div>
            <h3 className="section-heading">Temperature Trend</h3>
            <p className="section-sub">Last 50 sensor readings across all warehouses</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 bg-red-400 rounded-full" />Alert zone
          </span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f015" />
            <XAxis dataKey="index" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#f1f5f9' }}
              formatter={(value, name) => [
                name === 'temperature' ? `${value}°C` : `${value}%`,
                name === 'temperature' ? 'Temperature' : 'Humidity'
              ]}
            />
            <Legend />
            {/* Alert threshold lines */}
            <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Max 8°C', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={-8} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Min -8°C', fill: '#ef4444', fontSize: 10 }} />

            <Area type="monotone" dataKey="temperature" stroke="#16a34a" strokeWidth={2} fill="url(#tempGradient)" name="Temperature (°C)" dot={<CustomDot />} />
            <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={1.5} fill="url(#humidGradient)" name="Humidity (%)" dot={false} opacity={0.7} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Log Table */}
      <div className="card overflow-hidden animate-fade-in" style={{animationDelay: '0.3s'}}>
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="section-title">Logs</p>
            <h3 className="section-heading">Temperature Log History</h3>
          </div>
          <div className="flex items-center gap-3">
            <select value={warehouseFilter} onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }} className="input w-auto text-sm">
              <option value="">All Warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button
              onClick={() => { setAlertOnly(!alertOnly); setPage(1); }}
              className={`btn text-sm ${alertOnly ? 'btn-danger' : 'btn-secondary'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {alertOnly ? 'Showing Alerts' : 'All Logs'}
            </button>
          </div>
        </div>
        <div className="table-container border-0">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Warehouse</th><th>Temperature</th><th>Humidity</th><th>Status</th><th>Recorded At</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No temperature logs found</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className={log.alert_triggered ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                  <td className="font-medium">#{log.id}</td>
                  <td>{log.warehouse_id ? `Warehouse #${log.warehouse_id}` : '—'}</td>
                  <td>
                    <span className={`font-bold ${log.alert_triggered ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                      {log.temperature_celsius}°C
                    </span>
                  </td>
                  <td>{log.humidity_percent != null ? `${log.humidity_percent}%` : '—'}</td>
                  <td>
                    {log.alert_triggered ? (
                      <span className="badge badge-danger">
                        <AlertTriangle className="w-3 h-3" /> Alert
                      </span>
                    ) : (
                      <span className="badge badge-success">Normal</span>
                    )}
                  </td>
                  <td className="text-xs text-gray-400">
                    {log.recorded_at ? new Date(log.recorded_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700">
          <Pagination page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
