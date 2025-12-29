import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Package, AlertCircle, Trash2, Edit2, X, Save } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const orgName = localStorage.getItem('organizationName') || 'My Organization';
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ 
    name: '', sku: '', description: '', quantity: '', price: '', costPrice: '', lowStockThreshold: '' 
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // --- Fetch Data ---
  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => {
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    })
    .catch(() => navigate('/login'));
  };

  useEffect(() => { fetchProducts(); }, []);

  // --- Search Logic ---
  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  // --- Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
        ? `http://localhost:5000/api/products/${editingId}` 
        : 'http://localhost:5000/api/products';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      resetForm();
      fetchProducts(); 
    } else {
        alert("Error saving product. SKU might be duplicate.");
    }
  };

  // --- Edit Click ---
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setForm({
        name: product.name,
        sku: product.sku,
        description: product.description || '', 
        quantity: product.quantity,
        price: product.price,
        costPrice: product.costPrice || '',
        lowStockThreshold: product.lowStockThreshold || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
        const updated = products.filter(p => p.id !== id);
        setProducts(updated);
        setFilteredProducts(updated);
    }
  };

  // --- Reset ---
  const resetForm = () => {
      setForm({ name: '', sku: '', description: '', quantity: '', price: '', costPrice: '', lowStockThreshold: '' });
      setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
             <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                <ArrowLeft size={20} />
             </Link>
             <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                <Package className="text-blue-600" size={24} />
                Inventory Management
             </h1>
        </div>
        <div className="text-sm text-gray-500">
            Organization: <span className="font-medium text-gray-900">{orgName}</span>
        </div>
      </nav>

      <main className="flex-1 w-full px-8 py-8">
        
        {/* --- Form Section --- */}
        <div className={`rounded-xl border shadow-sm p-6 mb-8 transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${editingId ? 'text-blue-800' : 'text-gray-800'}`}>
                {editingId ? <Edit2 size={18}/> : <Plus size={18}/>} 
                {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Row 1: Basic Info */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Product Name</label>
                    <input required placeholder="e.g. Wireless Mouse" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white" 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">SKU (ID)</label>
                    <input required placeholder="e.g. WM-001" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white" 
                        value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
                </div>

                <div>
                   <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quantity</label>
                    <input required type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white" 
                        value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                </div>

                {/* Row 2: Description (Full Width) */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (Optional)</label>
                    <textarea rows="2" placeholder="Product details..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white" 
                        value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                {/* Row 3: Pricing & Thresholds */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Selling Price ($)</label>
                    <input required type="number" placeholder="0.00" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white" 
                        value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cost Price ($)</label>
                    <input required type="number" placeholder="0.00" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white" 
                        value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Low Stock Alert</label>
                    <input type="number" placeholder="Default" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white" 
                        value={form.lowStockThreshold} onChange={e => setForm({...form, lowStockThreshold: e.target.value})} />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    {editingId && (
                        <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 h-10.5">
                            <X size={18} /> Cancel
                        </button>
                    )}
                    <button className={`${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 h-10.5 whitespace-nowrap`}>
                        {editingId ? <Save size={18} /> : <Plus size={18} />} 
                        {editingId ? 'Update' : 'Add'}
                    </button>
                </div>
            </form>
        </div>

        {/* --- Product List Table --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Current Inventory ({filteredProducts.length})</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input placeholder="Search products..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 bg-white"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Selling Price</th>
                            <th className="px-6 py-4">Cost Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Quantity</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading products...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="7" className="p-12 text-center text-gray-400"><p>No products found.</p></td></tr>
                        ) : (
                            filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {p.name}
                                        {p.description && <div className="text-xs text-gray-400 font-normal">{p.description}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                                    
                                    <td className="px-6 py-4 text-gray-700 font-medium">${p.price}</td>

                                    <td className="px-6 py-4 text-gray-500">
                                        {p.costPrice ? `$${p.costPrice}` : '-'}
                                    </td>

                                    <td className="px-6 py-4">
                                        {p.quantity <= p.lowStockThreshold ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><AlertCircle size={12}/> Low Stock</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">In Stock</span>
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${p.quantity <= p.lowStockThreshold ? 'text-red-600' : 'text-gray-700'}`}>{p.quantity}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => handleEditClick(p)} className="text-gray-400 hover:text-blue-600 transition p-1"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 transition p-1"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}