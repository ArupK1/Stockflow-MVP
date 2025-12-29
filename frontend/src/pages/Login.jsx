import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    organizationName: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Basic Validation
    if (isSignup && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    setLoading(true);
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    
    try {
        const res = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        
        if (res.ok) {
            if (isSignup) {
                // Auto-switch to login view after successful signup
                setIsSignup(false);
                setFormData({ ...formData, password: '', confirmPassword: '' });
                alert("Account created successfully! Please log in.");
              } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('organizationName', data.organizationName); // <--- SAVE NAME
                navigate('/dashboard');
              }
        } else {
            setError(data.error || "Something went wrong.");
        }
    } catch (err) {
        setError("Failed to connect to server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="px-8 py-6 bg-white border-b border-gray-50 text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Building2 className="text-white w-6 h-6" />
                </div>
                StockFlow
            </h1>
            <p className="text-sm text-gray-500 mt-2">
                {isSignup ? "Create your organization account" : "Welcome back, please log in"}
            </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Organization Name (Signup Only) */}
                {isSignup && (
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Organization Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="e.g. Acme Corp"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                onChange={e => setFormData({...formData, organizationName: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="you@company.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                </div>

                {/* Confirm Password (Signup Only) */}
                {isSignup && (
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                )}

                <button 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                    {loading ? (
                        "Processing..." 
                    ) : (
                        isSignup ? <><UserPlus size={18} /> Create Account</> : <><LogIn size={18} /> Sign In</>
                    )}
                </button>
            </form>
        </div>

        {/* Footer / Toggle Section */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <button 
                onClick={() => {
                    setIsSignup(!isSignup); 
                    setError('');
                }}
                className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center gap-1 mx-auto transition"
            >
                {isSignup ? 'Already have an account? Log In' : 'Need an account? Create Organization'}
                <ArrowRight size={14} />
            </button>
        </div>

      </div>
    </div>
  );
}