import React, { useState, useEffect } from 'react';
import { vehicleAPI, rentalAPI } from '../services/api'; 
import Loading from '../components/Loading';
import RequestForm from '../components/RequestForm'; 
import VehicleCard from '../components/VehicleCard'; 
import { useToast } from '../context/ToastContext'; 

const UserDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [approvedBookings, setApprovedBookings] = useState([]);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const [vRes, rRes] = await Promise.all([
            vehicleAPI.get('/all-for-user'),
            rentalAPI.get('/my-requests')
        ]);

        setVehicles(vRes.data);
        setMyRequests(rRes.data);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showToast("Erro ao carregar dados do painel.", 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleVehicleSelect = async (vehicle) => {
    try {
        const res = await vehicleAPI.get(`/${vehicle._id}/approved-rentals`);
        
        setApprovedBookings(res.data);
        setSelectedVehicle(vehicle);
    } catch (error) {
        console.error("Erro ao buscar agendamentos do veículo:", error);
        showToast("Não foi possível carregar a disponibilidade do veículo.", 'error');
    }
  };

  const handleRequestSuccess = (newRequest) => {
    setMyRequests([newRequest, ...myRequests]); 
    setSelectedVehicle(null); 
    showToast('Solicitação enviada com sucesso!', 'success');
  };

  const handleNotification = (notification) => {
      showToast(notification.message, notification.type);
  };

  const stats = {
    total: myRequests.length,
    pending: myRequests.filter(r => r.status === 'pending').length,
    approved: myRequests.filter(r => r.status === 'approved').length,
    rejected: myRequests.filter(r => r.status === 'rejected').length
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen w-full">
      <Loading />
    </div>
  );

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 w-full"> 
        
        <div className="pb-5 border-b border-gray-200 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Minha Área</h1>
            <p className="mt-1 text-sm text-gray-500">Gerencie suas viagens e solicite novos veículos.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Solicitado</h3>
                <div className="mt-1 flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    <p className="text-sm text-gray-500">Histórico completo</p>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pendentes</h3>
                <div className="mt-1 flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                    <p className="text-sm text-gray-500">Aguardando análise</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Aprovados</h3>
                <div className="mt-1 flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
                    <p className="text-sm text-gray-500">Prontos para retirar</p>
                </div>
            </div>
        </div>

        {!selectedVehicle ? (
            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100">
                <div className="text-left mb-6">
                    <h2 className="text-xl font-bold text-gray-900">🚗 Nova Solicitação</h2>
                    <p className="text-sm text-gray-500">Escolha um veículo disponível para iniciar o agendamento.</p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.filter(v => v.status !== 'maintenance').map(vehicle => (
                            <VehicleCard 
                                key={vehicle._id} 
                                vehicle={vehicle} 
                                onSelect={handleVehicleSelect} 
                            />
                        ))}
                        {vehicles.length === 0 && <p className="col-span-full text-center py-4 text-gray-500">Nenhum veículo disponível no momento.</p>}
                    </div>
                </div>
            </section>
        ) : (
           
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                    <RequestForm 
                        vehicle={selectedVehicle} 
                        approvedBookings={approvedBookings}
                        onSuccess={handleRequestSuccess}
                        onCancel={() => setSelectedVehicle(null)}
                        onNotification={handleNotification} 
                    />
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default UserDashboard;