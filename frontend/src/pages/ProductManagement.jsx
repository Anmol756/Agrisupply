/**
 * Product Management — CRUD with category filtering and farmer linkage.
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Loader2 } from 'lucide-react';
import api from '../api/client';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';

const emptyForm = { farmer_id: '', name: '', category: '', quantity_kg: 0, price_per_kg: 0, harvest_date: '', expiry_date: '' };
const categories = ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Pulses'];

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProducts(); }, [page, search, catFilter]);
  useEffect(() => { loadFarmers(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, search: search || undefined, category: catFilter || undefined };
      const res = await api.get('/api/products/', { params });
      setProducts(res.data.items);
      setMeta({ total: res.data.total, pages: res.data.pages });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadFarmers = async () => {
    try {
      const res = await api.get('/api/farmers/', { params: { limit: 100 } });
      setFarmers(res.data.items);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ ...p, harvest_date: p.harvest_date || '', expiry_date: p.expiry_date || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, farmer_id: parseInt(form.farmer_id), harvest_date: form.harvest_date || null, expiry_date: form.expiry_date || null };
    try {
      if (editId) await api.put(`/api/products/${editId}`, data);
      else await api.post('/api/products/', data);
      setModalOpen(false);
      loadProducts();
    } catch (err) { alert(err.response?.data?.detail || 'Error saving product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/api/products/${id}`); loadProducts(); }
    catch (err) { alert('Error deleting product'); }
  };

  const isExpiringSoon = (d) => {
    if (!d) return false;
    const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  const isExpired = (d) => {
    if (!d) return false;
    return new Date(d) < new Date();
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-title">Inventory</p>
          <h2 className="section-heading text-xl mt-0.5">Products</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products…" className="input pl-9 w-48" />
          </div>
          <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
            className="input w-auto min-w-[140px]">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={openCreate} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Product</button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-green-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <div key={p.id} className="card p-5 animate-fade-in hover:shadow-xl" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${
                  p.category === 'Vegetables' ? 'badge-success' :
                  p.category === 'Fruits' ? 'badge-warning' :
                  p.category === 'Grains' ? 'badge-neutral' :
                  p.category === 'Spices' ? 'badge-danger' : 'badge-info'
                }`}>{p.category || 'Other'}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{p.name}</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Quantity</span><span className="font-medium text-gray-700 dark:text-gray-200">{p.quantity_kg} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="font-medium text-green-600">₹{p.price_per_kg}/kg</span></div>
                {p.expiry_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expiry</span>
                    <span className={`font-medium ${isExpired(p.expiry_date) ? 'text-red-500' : isExpiringSoon(p.expiry_date) ? 'text-amber-500' : 'text-gray-500'}`}>
                      {new Date(p.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farmer *</label>
              <select className="input" value={form.farmer_id} onChange={(e) => setForm({ ...form, farmer_id: e.target.value })} required>
                <option value="">Select farmer</option>
                {farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select className="input" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity (kg)</label>
              <input className="input" type="number" step="0.1" value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹/kg)</label>
              <input className="input" type="number" step="0.01" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harvest Date</label>
              <input className="input" type="date" value={form.harvest_date || ''} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
              <input className="input" type="date" value={form.expiry_date || ''} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            </div>
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
