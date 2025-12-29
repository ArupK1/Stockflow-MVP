import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Package, AlertCircle, Trash2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', quantity: '', price: '', lowStockThreshold: '5' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

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
      setLoading(false);
    })
    .catch(() => navigate('/login'));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ name: '', sku: '', quantity: '', price: '', lowStockThreshold: '5' }); 
      fetchProducts(); 
    } else {
        alert("Error adding product. SKU might be duplicate.");
    }
  };

  const handleDelete = async (id) => {
    // 1. Confirm with user (PRD Requirement)
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
    } else {
        alert("Failed to delete product.");
    }
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
            Organization: <span className="font-medium text-gray-900">My Store</span>
        </div>
      </nav>

      <main className="flex-1 w-full px-8 py-8">
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-blue-600"/> Add New Product
            </h2>
            
            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Product Name</label>
                    <input 
                        required 
                        placeholder="e.g. Wireless Mouse" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900" 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})} 
                    />
                </div>
                
                <div className="w-full md:w-48">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">SKU (ID)</label>
                    <input 
                        required 
                        placeholder="e.g. WM-001" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" 
                        value={form.sku} 
                        onChange={e => setForm({...form, sku: e.target.value})} 
                    />
                </div>

                <div className="w-full md:w-32">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price ($)</label>
                    <input 
                        required 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" 
                        value={form.price} 
                        onChange={e => setForm({...form, price: e.target.value})} 
                    />
                </div>

                <div className="w-full md:w-32">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quantity</label>
                    <input 
                        required 
                        type="number" 
                        placeholder="0" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" 
                        value={form.quantity} 
                        onChange={e => setForm({...form, quantity: e.target.value})} 
                    />
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 h-10.5 whitespace-nowrap">
                    <Plus size={18} /> Add Item
                </button>
            </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Current Inventory ({products.length})</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        placeholder="Search products..." 
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Quantity</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading products...</td></tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Package size={40} className="text-gray-300" />
                                        <p>No products added yet.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                                    <td className="px-6 py-4 text-gray-700">${p.price}</td>
                                    <td className="px-6 py-4">
                                        {p.quantity <= p.lowStockThreshold ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                <AlertCircle size={12}/> Low Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                In Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${p.quantity <= p.lowStockThreshold ? 'text-red-600' : 'text-gray-700'}`}>
                                        {p.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* --- CLICKABLE TRASH ICON --- */}
                                        <button 
                                            onClick={() => handleDelete(p.id)}
                                            className="text-gray-400 hover:text-red-600 transition p-1"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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