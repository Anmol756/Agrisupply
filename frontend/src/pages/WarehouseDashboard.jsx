/**
 * Warehouse Dashboard — capacity visualization, inventory, and CRUD.
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Snowflake, Sun, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';

const emptyForm = { name: '', location: '', city: '', capacity_tons: 0, current_load_tons: 0, storage_type: 'mixed', min_temp: '', max_temp: '' };

export default function WarehouseDashboard() {
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadWarehouses(); }, [page, search, typeFilter]);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search: search || undefined, storage_type: typeFilter || undefined };
      const res = await api.get('/api/warehouses/', { params });
      setWarehouses(res.data.items);
      setMeta({ total: res.data.total, pages: res.data.pages });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (w) => { setEditId(w.id); setForm({ ...w, min_temp: w.min_temp ?? '', max_temp: w.max_temp ?? '' }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, min_temp: form.min_temp !== '' ? parseFloat(form.min_temp) : null, max_temp: form.max_temp !== '' ? parseFloat(form.max_temp) : null };
    try {
      if (editId) await api.put(`/api/warehouses/${editId}`, data);
      else await api.post('/api/warehouses/', data);
      setModalOpen(false);
      loadWarehouses();
    } catch (err) { alert(err.response?.data?.detail || 'Error saving warehouse'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this warehouse?')) return;
    try { await api.delete(`/api/warehouses/${id}`); loadWarehouses(); }
    catch (err) { alert('Error deleting warehouse'); }
  };

  const getUtilization = (w) => w.capacity_tons > 0 ? Math.round((w.current_load_tons / w.capacity_tons) * 100) : 0;
  const getStorageIcon = (type) => {
    if (type === 'cold') return <Snowflake className="w-4 h-4 text-blue-400" />;
    if (type === 'dry') return <Sun className="w-4 h-4 text-amber-400" />;
    return <Layers className="w-4 h-4 text-purple-400" />;
  };

  const chartData = warehouses.map(w => ({
    name: w.name.length > 12 ? w.name.substring(0, 12) + '...' : w.name,
    Capacity: w.capacity_tons,
    Load: w.current_load_tons,
  }));

  return (
    <div className="space-y-5">
      {/* Chart */}
      {warehouses.length > 0 && (
        <div className="card p-5 animate-fade-in">
          <div className="section-header mb-4">
            <div>
              <h3 className="section-heading">Capacity Overview</h3>
              <p className="section-sub">Current load vs. total capacity per facility</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#f1f5f9' }} />
              <Bar dataKey="Capacity" fill="#22c55e30" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Load" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-title">Facilities</p>
          <h2 className="section-heading text-xl mt-0.5">All Warehouses</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search warehouses…" className="input pl-9 w-48" />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="input w-auto">
            <option value="">All Types</option>
            <option value="cold">Cold</option>
            <option value="dry">Dry</option>
            <option value="mixed">Mixed</option>
          </select>
          <button onClick={openCreate} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Warehouse</button>
        </div>
      </div>

      {/* Warehouse Cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>
      ) : warehouses.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No warehouses found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {warehouses.map((w, i) => {
            const util = getUtilization(w);
            const utilColor = util > 85 ? 'bg-red-500' : util > 60 ? 'bg-amber-500' : 'bg-green-500';
            return (
              <div key={w.id} className="card p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStorageIcon(w.storage_type)}
                    <StatusBadge status={w.storage_type} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">{w.name}</h4>
                <p className="text-xs text-gray-400 mb-4">{w.location || w.city || '—'}</p>

                {/* Capacity Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Utilization</span>
                    <span className={`font-bold ${util > 85 ? 'text-red-500' : util > 60 ? 'text-amber-500' : 'text-green-600'}`}>{util}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${utilColor} rounded-full transition-all duration-700`} style={{ width: `${util}%` }}></div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{w.current_load_tons} / {w.capacity_tons} tons</p>
                </div>

                {/* Temp Range */}
                {(w.min_temp !== null || w.max_temp !== null) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Snowflake className="w-3 h-3 text-blue-400" />
                    <span>Temp: {w.min_temp ?? '—'}°C to {w.max_temp ?? '—'}°C</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Warehouse' : 'Add New Warehouse'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input className="input" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input className="input" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Storage Type</label>
              <select className="input" value={form.storage_type} onChange={(e) => setForm({ ...form, storage_type: e.target.value })}>
                <option value="cold">Cold</option><option value="dry">Dry</option><option value="mixed">Mixed</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (tons)</label>
              <input className="input" type="number" step="0.1" value={form.capacity_tons} onChange={(e) => setForm({ ...form, capacity_tons: parseFloat(e.target.value) || 0 })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Load (tons)</label>
              <input className="input" type="number" step="0.1" value={form.current_load_tons} onChange={(e) => setForm({ ...form, current_load_tons: parseFloat(e.target.value) || 0 })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Temp (°C)</label>
              <input className="input" type="number" step="0.1" value={form.min_temp} onChange={(e) => setForm({ ...form, min_temp: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Temp (°C)</label>
              <input className="input" type="number" step="0.1" value={form.max_temp} onChange={(e) => setForm({ ...form, max_temp: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}{editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
