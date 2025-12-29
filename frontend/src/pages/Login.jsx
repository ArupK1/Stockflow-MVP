import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', organizationName: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    
    // Note: We will add the API URL in the next step
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      if (isSignup) {
        setIsSignup(false); // Switch to login after signup
        alert("Account created! Please log in.");
      } else {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="mb-6 text-2xl font-bold text-center text-blue-600">StockFlow</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Organization Name"
              className="w-full p-2 border rounded"
              onChange={e => setFormData({...formData, organizationName: e.target.value})}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          <button className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600 cursor-pointer" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
        </p>
      </div>
    </div>
  );
}