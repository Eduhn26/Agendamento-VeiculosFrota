import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const redirectPath = result.user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(redirectPath);
      showToast(`Bem-vindo(a), ${result.user.name.split(' ')[0]}!`, 'success');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-800 p-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-center mb-8 text-2xl font-bold text-gray-900">Sistema de Aluguel de Veículos</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-sm">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 text-sm">Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition outline-none"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-blue-700 text-white rounded-lg text-lg font-semibold cursor-pointer transition duration-200 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;