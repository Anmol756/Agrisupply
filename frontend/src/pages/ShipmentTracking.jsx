/**
 * Shipment Tracking — pipeline view with status filtering and CRUD.
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';

const emptyForm = { product_id: '', warehouse_id: '', transport_id: '', origin: '', destination: '', status: 'pending', shipped_at: '', delivered_at: '' };
const statusOptions = ['pending', 'in_transit', 'delivered', 'cancelled'];

export default function ShipmentTracking() {
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transports, setTransports] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadShipments(); }, [page, search, statusFilter]);
  useEffect(() => { loadDropdowns(); }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search: search || undefined, status: statusFilter || undefined };
      const res = await api.get('/api/shipments/', { params });
      setShipments(res.data.items);
      setMeta({ total: res.data.total, pages: res.data.pages });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadDropdowns = async () => {
    try {
      const [p, w, t] = await Promise.all([
        api.get('/api/products/', { params: { limit: 100 } }),
        api.get('/api/warehouses/', { params: { limit: 100 } }),
        api.get('/api/transport/', { params: { limit: 100 } }),
      ]);
      setProducts(p.data.items);
      setWarehouses(w.data.items);
      setTransports(t.data.items);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ ...s, shipped_at: s.shipped_at || '', delivered_at: s.delivered_at || '' }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      product_id: parseInt(form.product_id),
      warehouse_id: parseInt(form.warehouse_id),
      transport_id: form.transport_id ? parseInt(form.transport_id) : null,
      shipped_at: form.shipped_at || null,
      delivered_at: form.delivered_at || null,
    };
    try {
      if (editId) await api.put(`/api/shipments/${editId}`, data);
      else await api.post('/api/shipments/', data);
      setModalOpen(false);
      loadShipments();
    } catch (err) { alert(err.response?.data?.detail || 'Error saving shipment'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this shipment?')) return;
    try { await api.delete(`/api/shipments/${id}`); loadShipments(); }
    catch (err) { alert('Error deleting shipment'); }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'in_transit': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Status Cards */}
      <div>
        <p className="section-title mb-3">Pipeline Overview</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statusOptions.map((s, i) => {
          const count = shipments.filter(sh => (typeof sh.status === 'string' ? sh.status : sh.status) === s).length;
          return (
            <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
              className={`card p-4 flex items-center gap-3 cursor-pointer transition-all ${statusFilter === s ? 'ring-2 ring-green-500' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                s === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                s === 'in_transit' ? 'bg-blue-100 dark:bg-blue-900/30' :
                s === 'delivered' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>{getStatusIcon(s)}</div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-800 dark:text-white">{count}</p>
                <p className="text-xs text-gray-400 capitalize">{s.replace('_', ' ')}</p>
              </div>
            </button>
          );
        })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-title">Records</p>
          <h2 className="section-heading text-xl mt-0.5">All Shipments</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by origin or destination…" className="input pl-9 w-60" />
          </div>
          <button onClick={openCreate} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Shipment</button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container border-0">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Origin</th><th>Destination</th><th>Status</th><th>Shipped</th><th>Delivered</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" /></td></tr>
              ) : shipments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No shipments found</td></tr>
              ) : shipments.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">#{s.id}</td>
                  <td>{s.origin || '—'}</td>
                  <td>{s.destination || '—'}</td>
                  <td><StatusBadge status={typeof s.status === 'string' ? s.status : s.status} /></td>
                  <td className="text-xs text-gray-400">{s.shipped_at ? new Date(s.shipped_at).toLocaleDateString() : '—'}</td>
                  <td className="text-xs text-gray-400">{s.delivered_at ? new Date(s.delivered_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Shipment' : 'Create Shipment'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product *</label>
              <select className="input" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
                <option value="">Select</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse *</label>
              <select className="input" value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} required>
                <option value="">Select</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transport</label>
              <select className="input" value={form.transport_id || ''} onChange={(e) => setForm({ ...form, transport_id: e.target.value })}>
                <option value="">None</option>
                {transports.map(t => <option key={t.id} value={t.id}>{t.vehicle_number} — {t.driver_name}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin</label>
              <input className="input" value={form.origin || ''} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination</label>
              <input className="input" value={form.destination || ''} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
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
