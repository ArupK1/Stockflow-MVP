import config from '../config'; // <--- Import Config
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [threshold, setThreshold] = useState(''); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch current setting on load
  useEffect(() => {
    // FIX: Use config.API_URL
    fetch(`${config.API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => {
      setThreshold(data.defaultLowStockThreshold !== undefined ? data.defaultLowStockThreshold : 5);
    })
    .catch(() => navigate('/login'));
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // FIX: Use config.API_URL
    const res = await fetch(`${config.API_URL}/api/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ defaultLowStockThreshold: threshold })
    });

    setLoading(false);
    if (res.ok) {
        alert("Settings saved successfully!");
    } else {
        alert("Error saving settings. (Check if database migration was run)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* --- Navbar --- */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 w-full flex items-center gap-4">
         <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
            <ArrowLeft size={20} />
         </Link>
         <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <SettingsIcon className="text-blue-600" size={24} />
            Organization Settings
         </h1>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 w-full px-8 py-8 flex justify-center">
        
        <div className="w-full max-w-2xl">
            {/* Title Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Global Preferences</h2>
                <p className="text-gray-500 mt-1">Manage defaults for your organization's inventory.</p>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-600"/>
                    <h3 className="font-semibold text-gray-800">Low Stock Alerts</h3>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Default Threshold
                            </label>
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                When you add a new product, this value will be used to determine when to show a "Low Stock" warning. 
                                (You can still override this for individual products).
                            </p>
                            
                            <div className="flex items-center gap-3">
                                <input 
                                    type="number" 
                                    required 
                                    min="0"
                                    className="w-32 bg-white text-gray-900 border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition"
                                    value={threshold ?? ''} 
                                    onChange={e => setThreshold(e.target.value)} 
                                />
                                <span className="text-gray-500 font-medium">units remaining</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button 
                                disabled={loading}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm
                                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                                `}
                            >
                                <Save size={18} /> 
                                {loading ? 'Saving Changes...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}