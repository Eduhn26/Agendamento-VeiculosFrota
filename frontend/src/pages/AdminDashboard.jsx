import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI, rentalAPI } from '../services/api';
import Loading from '../components/Loading'; 
import { useToast } from '../context/ToastContext'; 


const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    maintenanceVehicles: 0, 
    pendingRequests: 0,
    activeRentals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      const [vehiclesStatsRes, rentalsStatsRes] = await Promise.all([
        vehicleAPI.get('/stats'), 
        rentalAPI.get('/stats')
      ]);
      const vehiclesStats = vehiclesStatsRes.data;
      const rentalsStats = rentalsStatsRes.data;
      
      setStats({
        totalVehicles: vehiclesStats.totalVehicles,
        availableVehicles: vehiclesStats.availableVehicles,
        maintenanceVehicles: vehiclesStats.maintenanceVehicles,
        pendingRequests: rentalsStats.pendingRequests,
        activeRentals: rentalsStats.approvedRequests
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      showToast('Falha ao carregar dados do dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />; 

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="pb-5 border-b border-gray-200 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard Administrativo</h1>
          <p className="mt-1 text-sm text-gray-500">Visão geral da frota e solicitações pendentes.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"> 
        
        <div 
          className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600 cursor-pointer hover:shadow-xl transition duration-200"
          onClick={() => navigate('/admin/vehicles')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total da Frota</h3>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</div>
            <p className="text-sm text-gray-500">Veículos cadastrados</p>
          </div>
        </div>

        <div 
          className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition duration-200"
          onClick={() => navigate('/admin/vehicles?filter=available')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Disponíveis</h3>
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">{stats.availableVehicles}</div>
            <p className="text-sm text-gray-500">Prontos para uso</p>
          </div>
        </div>
        
        <div 
          className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500 cursor-pointer hover:shadow-xl transition duration-200"
          onClick={() => navigate('/admin/vehicles?filter=maintenance')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Manutenção</h3>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">{stats.maintenanceVehicles}</div>
            <p className="text-sm text-gray-500">Veículos em revisão</p>
          </div>
        </div>
        
        <div 
          className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 cursor-pointer hover:shadow-xl transition duration-200"
          onClick={() => navigate('/admin/requests?filter=pending')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pendentes</h3>
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h.01"></path></svg>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</div>
            <p className="text-sm text-gray-500">Aguardando aprovação</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;