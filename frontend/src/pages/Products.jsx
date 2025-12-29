import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', quantity: '', price: '', lowStockThreshold: '5' });

  const token = localStorage.getItem('token');

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setProducts(data));
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
      setForm({ name: '', sku: '', quantity: '', price: '', lowStockThreshold: '5' }); // Reset form
      fetchProducts(); // Refresh list
    } else {
        alert("Error adding product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-blue-600 hover:underline mb-4 block">&larr; Back to Dashboard</Link>
        <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
                <input required placeholder="Product Name" className="border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input required placeholder="SKU (Unique ID)" className="border p-2 rounded" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
                <input required type="number" placeholder="Quantity" className="border p-2 rounded" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                <input required type="number" placeholder="Price" className="border p-2 rounded" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                <button className="col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700">Add Product</button>
            </form>
        </div>

        {/* Product List */}
        <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{p.name}</td>
                            <td className="p-4 text-gray-500">{p.sku}</td>
                            <td className="p-4">${p.price}</td>
                            <td className={`p-4 font-bold ${p.quantity <= p.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                                {p.quantity}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}