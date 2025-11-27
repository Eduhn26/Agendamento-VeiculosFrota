import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faIdCard, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { vehicleAPI, rentalAPI } from '../services/api'; 
import RequestForm from '../components/RequestForm'; 
import Loading from '../components/Loading'; 
import { useToast } from '../context/ToastContext'; 
import AddVehicleModal from '../components/AddVehicleModal'; 


import yarisImg from '../assets/vehicles/toyota-yaris.png';
import poloImg from '../assets/vehicles/vw-polo.png';
import compassImg from '../assets/vehicles/jeep-compass.png';
import etiosImg from '../assets/vehicles/toyota-etios.png';
import defaultImg from '../assets/vehicles/default-car.png';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = "inline-flex items-center font-semibold rounded-full border transition-colors";
  
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    primary: "bg-blue-100 text-blue-800 border-blue-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ current, target, interval = 20000 }) => {
  const cycleStart = target - interval;
  const progressInCycle = current - cycleStart;
  let percentage = (progressInCycle / interval) * 100;
  percentage = Math.max(0, Math.min(percentage, 100));
  
  const remaining = target - current;
  const isOverdue = remaining <= 0;

  const getColorClass = (percent) => {
    if (percent >= 100 || isOverdue) return 'bg-red-600';
    if (percent > 80) return 'bg-orange-500';
    if (percent > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
        <span className="bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent font-semibold">
          Próxima Revisão: {target.toLocaleString()} km
        </span>
        <span className={isOverdue ? 'text-red-600 font-bold' : 'text-blue-600'}>
          {isOverdue 
            ? `Passou ${Math.abs(remaining).toLocaleString()} km!` 
            : `Faltam ${remaining.toLocaleString()} km`
          }
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const getVehicleImage = (vehicle) => {
    if (vehicle.imageUrl) return vehicle.imageUrl;
    
    const brand = (vehicle.brand || '').toLowerCase().trim();
    const model = (vehicle.model || '').toLowerCase().trim();
    const key = `${brand} ${model}`;
    const imageMap = {
        'toyota yaris': yarisImg,
        'volkswagen polo highline': poloImg, 
        'jeep compass': compassImg,
        'toyota etios': etiosImg
    };
    
    return imageMap[key] || defaultImg;
};

const AdminVehicleCard = ({ vehicle, onStatusChange, onRent, onCompleteMaintenanceClick, onReturnClick, onDeleteClick }) => {
    const imageSource = getVehicleImage(vehicle);
    const isAvailable = vehicle.status === 'available';
    const isRented = vehicle.status === 'rented';
    
    const transmission = vehicle.transmissionType === 'automatic' ? 'Automático' : 'Manual';
    const fuel = vehicle.fuelType || 'Flex'; 
    const passengers = vehicle.passengers || 5;

    const nextMaintenance = vehicle.nextMaintenance || (Math.ceil((vehicle.mileage + 1) / 20000) * 20000);
    const needsMaintenance = vehicle.mileage >= nextMaintenance;
    const isMaintenanceStatus = vehicle.status === 'maintenance';

    let statusVariant = 'default';
    let statusLabel = 'Indisponível';

    if (isRented) {
        statusVariant = 'primary';
        statusLabel = 'Alugado';
    } else if (isMaintenanceStatus) {
        statusVariant = 'warning';
        statusLabel = 'Em Manutenção';
    } else if (isAvailable) {
        if (needsMaintenance) {
            statusVariant = 'error';
            statusLabel = 'Revisão Vencida';
        } else {
            statusVariant = 'success';
            statusLabel = 'Disponível';
        }
    }

    const statusInfo = { variant: statusVariant, label: statusLabel };

    return (
       
        <div className={`h-full relative bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg border group ${needsMaintenance ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 hover:border-blue-300'}`}>
            
            <div className="absolute top-3 left-3 z-20">
                 <button
                    onClick={(e) => { e.stopPropagation(); onDeleteClick(vehicle); }}
                    className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors shadow-lg transform hover:scale-105"
                    title="Excluir Veículo da Frota"
                >
                    <FontAwesomeIcon icon="trash-alt" size="sm" />
                </button>
            </div>
            
      
            <div className="w-full h-48 bg-gray-100 flex justify-center items-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10 pointer-events-none"></div>
                <img 
                    src={imageSource} 
                    alt={`${vehicle.brand} ${vehicle.model}`}
                  
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-500 relative z-0"
                    onError={(e) => { 
                      e.target.src = defaultImg; 
                    }}
                />
            </div>
            
           
            <div className="p-4 flex flex-col flex-grow">
                
                <div className="mb-3">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold leading-tight mb-0.5 bg-gradient-to-r from-gray-700 to-blue-500 bg-clip-text text-transparent pr-2">
                            {vehicle.brand} {vehicle.model}
                        </h3>
                        
                        <Badge variant={statusInfo.variant} size="sm" className="shadow-sm shrink-0">
                            {statusInfo.label}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-sm mt-2">
                        <div className="flex items-center gap-1.5" title="Placa do Veículo">
                            <FontAwesomeIcon icon={faIdCard} className="text-blue-600 text-base" />
                            <span className="text-gray-600 font-mono font-medium">
                                {vehicle.licensePlate}
                            </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1.5" title="Ano de Fabricação">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 text-base" />
                            <span className="text-gray-600 font-medium">
                                {vehicle.year}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm py-2 border-t border-gray-100 mb-3">
                    <div className="flex items-center gap-1.5 font-semibold">
                        <FontAwesomeIcon icon="tachometer-alt" className={needsMaintenance ? "text-red-500" : "text-blue-600"} />
                        <span className={needsMaintenance ? "text-red-600 font-bold" : "bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent"}>
                            {vehicle.mileage.toLocaleString()} km
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon="users" className="text-blue-600 text-base" />
                        <span className="text-gray-600">{passengers} lug.</span> 
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon="gas-pump" className="text-blue-600 text-base" />
                        <span className="text-gray-600">{fuel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon="cogs" className="text-blue-600 text-base" />
                        <span className="text-gray-600">{transmission}</span>
                    </div>
                </div>

                <div className="mt-auto mb-3">
                    <ProgressBar 
                        current={vehicle.mileage}
                        target={nextMaintenance}
                        interval={20000}
                    />
                </div>
                
                <div className="flex flex-col gap-2 mt-auto">
                    {isAvailable && (
                        <button 
                            className="w-full px-4 py-2.5 font-semibold rounded-lg shadow-sm transition-all duration-200 
                                      bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                                      hover:from-blue-700 hover:to-blue-800 hover:shadow-md
                                      active:scale-[0.98] transform shadow-blue-500/50"
                            onClick={() => onRent(vehicle)}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon="calendar-plus" />
                                Reservar Veículo
                            </div>
                        </button>
                    )}

                    {isRented && (
                        <button 
                            className="w-full px-4 py-2.5 font-semibold rounded-lg shadow-sm transition-all duration-200 
                                      bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                      hover:from-blue-600 hover:to-blue-700 hover:shadow-md
                                      active:scale-[0.98] transform shadow-blue-500/50"
                            onClick={() => onReturnClick(vehicle)}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon="key" />
                                Receber Veículo (Devolução)
                            </div>
                        </button>
                    )}

                    {(isMaintenanceStatus || needsMaintenance) ? (
                         <button 
                            className={`w-full px-4 py-2 text-sm rounded-lg border font-semibold transition-all duration-200 shadow-sm active:scale-[0.98]
                                ${isMaintenanceStatus 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                    : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300' 
                                }`}
                            onClick={() => onCompleteMaintenanceClick(vehicle)}
                            title="Clique para confirmar e registrar a revisão"
                         >
                            <div className="flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon="check-circle" />
                                {isMaintenanceStatus ? 'Finalizar Manutenção (Oficina)' : 'Confirmar Revisão Realizada'}
                            </div>
                         </button>
                    ) : (
                         !isRented && (
                            <button 
                                className="w-full px-4 py-2 text-sm rounded-lg border font-semibold transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border-gray-300 active:scale-[0.98]"
                                onClick={() => onStatusChange(vehicle._id, 'maintenance')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FontAwesomeIcon icon="tools" />
                                    Enviar para Manutenção
                                </div>
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, vehicle }) => {
    if (!isOpen || !vehicle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon="exclamation-triangle" />
                        Confirmação de Exclusão
                    </h3>
                </div>
                
                <div className="p-6">
                    <p className="text-gray-700 text-base mb-4">
                        Tem certeza que deseja **excluir permanentemente** o veículo:
                    </p>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                        <strong className="text-red-700 block text-lg">{vehicle.brand} {vehicle.model}</strong>
                        <span className="text-sm text-red-600">Placa: {vehicle.licensePlate}</span>
                    </div>

                    <p className="text-sm text-gray-500 italic">
                        Esta ação não pode ser desfeita. Todos os registros associados a este veículo serão removidos ou invalidados.
                    </p>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon="trash-alt" />
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, vehicle }) => {
    if (!isOpen || !vehicle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon="check-double" />
                        Confirmar Manutenção
                    </h3>
                </div>
                
                <div className="p-6">
                    <p className="text-gray-600 text-base mb-4">
                        Você está prestes a registrar a revisão do veículo <strong>{vehicle.brand} {vehicle.model}</strong>.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-blue-700 font-semibold">KM Atual:</span>
                            <span className="text-sm text-gray-800">{vehicle.mileage.toLocaleString()} km</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700 font-semibold">Próxima Revisão Será:</span>
                            <span className="text-sm text-gray-800 font-bold">
                                {Math.ceil((vehicle.mileage + 1) / 20000) * 20000} km
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 italic mb-2">
                        Isso removerá os alertas visuais e atualizará o status para "Disponível".
                    </p>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
                    >
                        Confirmar Revisão
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReturnModal = ({ isOpen, onClose, onConfirm, vehicle }) => {
    const [newMileage, setNewMileage] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && vehicle) {
            setNewMileage(vehicle.mileage);
            setNotes('');
            setError('');
        }
    }, [isOpen, vehicle]);

    if (!isOpen || !vehicle) return null;

    const handleSubmit = async () => {
        if (parseInt(newMileage) < vehicle.mileage) {
            setError('A nova quilometragem não pode ser menor que a atual.');
            return;
        }
        
        setLoading(true);
        await onConfirm(newMileage, notes);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon="clipboard-check" />
                        Finalizar Devolução
                    </h3>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <img 
                            src={vehicle.imageUrl || defaultImg} 
                            alt="Vehicle" 
                            className="w-16 h-16 object-contain bg-gray-100 rounded-lg p-1"
                        />
                        <div>
                            <h4 className="font-bold text-gray-800">{vehicle.brand} {vehicle.model}</h4>
                            <p className="text-sm text-gray-500">Placa: {vehicle.licensePlate}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quilometragem Atual (Devolução)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    value={newMileage}
                                    onChange={(e) => setNewMileage(e.target.value)}
                                    min={vehicle.mileage}
                                />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">km</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Anterior: {vehicle.mileage.toLocaleString()} km</p>
                            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações da Vistoria</label>
                            <textarea 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24 resize-none"
                                placeholder="Descreva o estado do veículo, avarias ou observações gerais..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        {loading ? 'Processando...' : 'Confirmar Devolução'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Vehicles = () => {
    const location = useLocation();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [approvedBookings, setApprovedBookings] = useState([]); 
    
  
    const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
    const [vehicleToMaintain, setVehicleToMaintain] = useState(null);

    
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [vehicleToReturn, setVehicleToReturn] = useState(null);
    
    
    const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
    
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    const { showToast } = useToast();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlFilter = params.get('filter');
        if (urlFilter) setFilter(urlFilter);
    }, [location]);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            const res = await vehicleAPI.get('/'); 
            setVehicles(res.data);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await vehicleAPI.patch(`/${id}`, { status: newStatus });
            loadVehicles(); 
            showToast(`Status atualizado para ${newStatus === 'maintenance' ? 'manutenção' : 'disponível'}`, 'success');
        } catch (error) {
            console.error("Erro ao atualizar status", error);
            showToast("Erro ao atualizar status", 'error');
        }
    };

    const handleOpenMaintenanceModal = (vehicle) => {
        setVehicleToMaintain(vehicle);
        setMaintenanceModalOpen(true);
    };

    const handleConfirmMaintenance = async () => {
        if (!vehicleToMaintain) return;

        try {
            await vehicleAPI.patch(`/${vehicleToMaintain._id}/complete-maintenance`);
            showToast("Manutenção registrada! Próxima revisão agendada.", "success");
            loadVehicles(); 
        } catch (error) {
            console.error("Erro ao concluir manutenção:", error);
            showToast("Erro ao registrar manutenção.", "error");
        } finally {
            setMaintenanceModalOpen(false);
            setVehicleToMaintain(null);
        }
    };

    const handleDeleteVehicle = (vehicle) => {
        setVehicleToDelete(vehicle);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!vehicleToDelete) return;

        try {
           
            await vehicleAPI.delete(`/${vehicleToDelete._id}`);
            showToast("Veículo excluído com sucesso!", "success");
            loadVehicles(); 
        } catch (error) {
            console.error("Erro ao excluir veículo:", error);
            const errorMessage = error.response?.data?.error || "Erro ao excluir veículo.";
            
            if (error.response && error.response.status === 400 && error.response.data.error.includes('reservas ativas')) {
                 showToast("Não é possível excluir: existem reservas ativas ou pendentes.", "error");
            } else if (error.response && error.response.status === 404) {
                 showToast("Erro 404: Rota de exclusão não encontrada.", "error");
            }
            else {
                 showToast(errorMessage, "error");
            }
        } finally {
            setDeleteModalOpen(false);
            setVehicleToDelete(null);
        }
    };
    // -------------------------

    const handleOpenReturnModal = (vehicle) => {
        setVehicleToReturn(vehicle);
        setReturnModalOpen(true);
    };

    const handleConfirmReturn = async (newMileage, notes) => {
        if (!vehicleToReturn) return;

        try {
            
            await rentalAPI.patch(`/return-by-vehicle/${vehicleToReturn._id}`, {
                newMileage,
                notes
            });
            showToast("Veículo devolvido com sucesso!", "success");
            loadVehicles(); 
        } catch (error) {
            console.error("Erro ao devolver veículo:", error);
            showToast("Erro ao registrar devolução.", "error");
        } finally {
            setReturnModalOpen(false);
            setVehicleToReturn(null);
        }
    };

    const handleRentClick = async (vehicle) => {
        try {
            const response = await vehicleAPI.get(`/${vehicle._id}/approved-rentals`);
            setApprovedBookings(response.data); 
            setSelectedVehicle(vehicle);
        } catch (error) {
            console.error("Erro ao buscar datas bloqueadas:", error);
            showToast("Erro ao carregar calendário", 'error');
        }
    };

    const handleRentSuccess = (newRequest) => {
        setSelectedVehicle(null);
        showToast('Reserva administrativa criada com sucesso!', 'success');
        loadVehicles(); 
    };
    
    const handleNotification = (notification) => {
        showToast(notification.message, notification.type);
    };

    const filteredVehicles = vehicles.filter(v => filter === 'all' || v.status === filter);

    const filterOptions = [
        { value: 'all', label: 'Todos', variant: 'default' },
        { value: 'available', label: 'Disponíveis', variant: 'success' },
        { value: 'maintenance', label: 'Manutenção', variant: 'warning' }
    ];

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8 w-full"> 
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-gray-200 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão da Frota</h1>
                        <p className="text-gray-600">Controle de disponibilidade, manutenção e reservas da frota.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setAddVehicleModalOpen(true)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all border bg-green-600 text-white border-green-600 shadow-md hover:bg-green-700"
                        >
                            <FontAwesomeIcon icon="car" className="mr-2" />
                            Novo Veículo
                        </button>
                         
                        {filterOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    filter === option.value
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

               
                <AddVehicleModal 
                    isOpen={addVehicleModalOpen}
                    onClose={() => setAddVehicleModalOpen(false)}
                    onSuccess={() => {
                        setAddVehicleModalOpen(false);
                        loadVehicles(); 
                    }}
                    onNotification={handleNotification}
                />
                
              
                <DeleteConfirmationModal
                    isOpen={deleteModalOpen}
                    vehicle={vehicleToDelete}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                />

                
                {selectedVehicle && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                            <RequestForm 
                                vehicle={selectedVehicle} 
                                approvedBookings={approvedBookings}
                                onSuccess={handleRentSuccess}
                                onCancel={() => setSelectedVehicle(null)}
                                onNotification={handleNotification}
                            />
                        </div>
                    </div>
                )}

                
                <ConfirmationModal 
                    isOpen={maintenanceModalOpen}
                    vehicle={vehicleToMaintain}
                    onClose={() => setMaintenanceModalOpen(false)}
                    onConfirm={handleConfirmMaintenance}
                />

               
                <ReturnModal 
                    isOpen={returnModalOpen}
                    vehicle={vehicleToReturn}
                    onClose={() => setReturnModalOpen(false)}
                    onConfirm={handleConfirmReturn}
                />

                {loading ? (
                    <div className="flex justify-center items-center min-h-64">
                        <Loading />
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {filteredVehicles.map(vehicle => (
                                <AdminVehicleCard 
                                    key={vehicle._id} 
                                    vehicle={vehicle}
                                    onStatusChange={handleStatusChange}
                                    onCompleteMaintenanceClick={handleOpenMaintenanceModal}
                                    onReturnClick={handleOpenReturnModal}
                                    onRent={handleRentClick}
                                    onDeleteClick={handleDeleteVehicle}
                                />
                            ))}
                            
                            {filteredVehicles.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-300">
                                        <div className="text-6xl mb-4">🚗</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Nenhum veículo encontrado
                                        </h3>
                                        <p className="text-gray-500">
                                            {filter === 'all' 
                                                ? 'Não há veículos cadastrados no sistema.' 
                                                : `Não há veículos com status \"${filter}\".`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Vehicles;