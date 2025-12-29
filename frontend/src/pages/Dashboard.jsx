import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, Layers, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Fetch data on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => setStats(data))
    .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!stats) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
      Loading Dashboard...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* --- Top Navigation Bar --- */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 w-full">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                <Package className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">StockFlow</h1>
        </div>
        
        <div className="flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                Inventory
            </Link>
            <Link to="/settings" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                Settings
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 transition">
                <LogOut size={16} /> Sign Out
            </button>
        </div>
      </nav>

      {/* --- Main Content (Full Width) --- */}
      <main className="flex-1 w-full px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Real-time inventory insights for your organization.</p>
            </div>
            <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-md hover:shadow-lg">
                Manage Inventory <ArrowRight size={16} />
            </Link>
        </div>

        {/* --- Stats Grid (Stretched) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
            
            {/* Card 1: Total Products */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Package size={20} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalProducts}</h3>
            </div>

            {/* Card 2: Total Units (Volume) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Units</p>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Layers size={20} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalStock}</h3>
            </div>

            {/* Card 3: Low Stock Alerts */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        <AlertTriangle size={20} />
                    </div>
                </div>
                <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-bold text-red-600">{stats.lowStockItems.length}</h3>
                    {stats.lowStockItems.length > 0 && (
                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full mb-1">Action Needed</span>
                    )}
                </div>
            </div>
        </div>

        {/* --- Low Stock Table Section (Full Width) --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                    <AlertTriangle size={18} className="text-orange-500"/> 
                    Low Stock Items
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Quantity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.lowStockItems.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                                            <Package size={32} />
                                        </div>
                                        <p className="text-lg font-medium text-gray-600">Everything is well stocked!</p>
                                        <p className="text-sm text-gray-400">No items are below their threshold level.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            stats.lowStockItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-500 font-mono">{item.sku}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                            Low Stock
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600">{item.quantity}</td>
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