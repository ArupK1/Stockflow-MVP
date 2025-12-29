import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, AlertTriangle } from 'lucide-react'; // Icons

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

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

  if (!stats) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="p-4 text-white bg-blue-600 flex justify-between items-center">
        <h1 className="text-xl font-bold">StockFlow Dashboard</h1>
        <div className="space-x-4">
            <Link to="/products" className="hover:underline">Manage Products</Link>
            <button onClick={handleLogout}><LogOut size={20} /></button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl p-6 mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: Total Stock */}
          <div className="p-6 bg-white rounded-lg shadow flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Package /></div>
            <div>
              <p className="text-gray-500">Total Products</p>
              <h2 className="text-2xl font-bold">{stats.totalProducts} Items</h2>
              <p className="text-sm text-gray-400">Total Units: {stats.totalStock}</p>
            </div>
          </div>

          {/* Card 2: Low Stock Warning */}
          <div className="p-6 bg-white rounded-lg shadow flex items-center space-x-4">
             <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle /></div>
             <div>
               <p className="text-gray-500">Low Stock Alerts</p>
               <h2 className="text-2xl font-bold text-red-600">{stats.lowStockItems.length} Products</h2>
               <p className="text-sm text-gray-400">Restock needed</p>
             </div>
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">Low Stock Items</h3>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.lowStockItems.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-4">{item.name}</td>
                                <td className="p-4 text-gray-500">{item.sku}</td>
                                <td className="p-4 text-red-600 font-bold">{item.quantity}</td>
                            </tr>
                        ))}
                        {stats.lowStockItems.length === 0 && (
                            <tr><td colSpan="3" className="p-4 text-center text-gray-500">Inventory looks good!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}