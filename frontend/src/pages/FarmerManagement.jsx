/**
 * Farmer Management — CRUD table with search, pagination, and add/edit modal.
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Phone, Loader2 } from 'lucide-react';
import api from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';

const emptyForm = { name: '', phone: '', email: '', address: '', city: '', state: '', land_area_acres: 0 };

export default function FarmerManagement() {
  const [farmers, setFarmers] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadFarmers(); }, [page, search]);

  const loadFarmers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/farmers/', { params: { page, limit: 10, search: search || undefined } });
      setFarmers(res.data.items);
      setMeta({ total: res.data.total, pages: res.data.pages });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (farmer) => { setEditId(farmer.id); setForm({ ...farmer }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/farmers/${editId}`, form);
      } else {
        await api.post('/api/farmers/', form);
      }
      setModalOpen(false);
      loadFarmers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving farmer');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this farmer?')) return;
    try {
      await api.delete(`/api/farmers/${id}`);
      loadFarmers();
    } catch (err) { alert('Error deleting farmer'); }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-title">Farmer Registry</p>
          <h2 className="section-heading text-xl mt-0.5">All Farmers</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, phone, city…"
              className="input pl-9 w-56"
            />
          </div>
          <button onClick={openCreate} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Farmer
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>State</th>
                <th>Land (Acres)</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" />
                </td></tr>
              ) : farmers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No farmers found</td></tr>
              ) : farmers.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                        {f.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{f.name}</p>
                        <p className="text-xs text-gray-400">{f.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td><div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><Phone className="w-3 h-3" />{f.phone}</div></td>
                  <td><div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-green-500" />{f.city || '—'}</div></td>
                  <td>{f.state || '—'}</td>
                  <td className="font-medium">{f.land_area_acres}</td>
                  <td className="text-xs text-gray-400">{new Date(f.registered_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Farmer' : 'Add New Farmer'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input className="input" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input className="input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input className="input" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
              <input className="input" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Land Area (Acres)</label>
              <input className="input" type="number" step="0.1" value={form.land_area_acres} onChange={(e) => setForm({ ...form, land_area_acres: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editId ? 'Update' : 'Create'} Farmer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
