import React, { useState, useEffect } from "react";
import { rentalAPI } from "../services/api";
import Loading from "../components/Loading";
import { useToast } from '../context/ToastContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { 
    faClock, 
    faCheckCircle, 
    faTimesCircle, 
    faCircleCheck, 
    faSearch, 
    faCar, 
    faUser, 
    faEye, 
    faClipboardCheck,
    faCalendarDay,
    faCalendarDays,
    faListAlt
} from '@fortawesome/free-solid-svg-icons'; 
import defaultImg from '../assets/vehicles/default-car.png';



const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  approved: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
};

const statusLabels = {
  pending: { label: 'Pendente', icon: faClock },
  approved: { label: 'Aprovada', icon: faCheckCircle },
  rejected: { label: 'Rejeitada', icon: faTimesCircle },
  completed: { label: 'Concluída', icon: faCircleCheck },
};

const formatRentalPeriod = (startDateStr, endDateStr) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const formatTime = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date) => date.toLocaleDateString('pt-BR');

    const startTime = formatTime(start);
    const endTime = formatTime(end);
    const startDatePart = formatDate(start);
    const endDatePart = formatDate(end);

    if (startDatePart === endDatePart) {
        return (
            <div className="text-gray-700">
                <p className="font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarDay} className="w-4 h-4 text-blue-500" />
                    {startDatePart}
                </p>
                <p className="text-xs text-gray-500 ml-6">{startTime} — {endTime}</p>
            </div>
        );
    } else {
        return (
            <div className="text-gray-700 space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="font-semibold flex items-center gap-2 text-gray-600">
                        <FontAwesomeIcon icon={faCar} className="w-4 h-4 text-green-500" />
                        Retirada:
                    </span>
                    <span className="text-right text-xs">{startDatePart} às {startTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="font-semibold flex items-center gap-2 text-gray-600">
                         <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-red-500" />
                        Devolução:
                    </span>
                    <span className="text-right text-xs">{endDatePart} às {endTime}</span>
                </div>
            </div>
        );
    }
};

const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
};


const ReturnModal = ({ isOpen, onClose, onConfirm, request }) => {
    const [newMileage, setNewMileage] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && request && request.vehicle) {
            setNewMileage(request.vehicle.mileage);
            setNotes('');
            setError('');
        }
    }, [isOpen, request]);

    if (!isOpen || !request) return null;

    const handleSubmit = async () => {
        if (parseInt(newMileage) < request.vehicle.mileage) {
            setError('A nova quilometragem não pode ser menor que a atual.');
            return;
        }
        
        setLoading(true);
        await onConfirm(request._id, newMileage, notes);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon={faClipboardCheck} />
                        Finalizar Devolução
                    </h3>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <img 
                            src={request.vehicle?.imageUrl || defaultImg} 
                            alt="Vehicle" 
                            className="w-16 h-16 object-contain bg-gray-100 rounded-lg p-1"
                            onError={(e) => { e.target.src = defaultImg; }}
                        />
                        <div>
                            <h4 className="font-bold text-gray-800">{request.vehicle?.brand} {request.vehicle?.model}</h4>
                            <p className="text-sm text-gray-500">Usuário: {request.user?.name}</p>
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
                                    min={request.vehicle?.mileage}
                                />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">km</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Anterior: {request.vehicle?.mileage?.toLocaleString()} km</p>
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

export default function RentalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [requestToReturn, setRequestToReturn] = useState(null);

  const { showToast } = useToast();

  const load = async () => {
    try {
      const res = await rentalAPI.get("/");
      setRequests(res.data);
    } catch (err) {
        showToast("Erro ao carregar solicitações.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = requests.filter((r) => {
    const f = filter === "all" || r.status === filter;
    const s =
      r.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicle?.model.toLowerCase().includes(search.toLowerCase());
    return f && s;
  });

  const updateStatus = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      await rentalAPI.patch(`/${selected._id}/status`, {
        status,
        notes,
      });
      setSelected(null);
      setNotes('');
      load();
      showToast(`Solicitação ${status} com sucesso!`, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao atualizar status.';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteRental = async (requestId, newMileage, notes) => {
      try {
          await rentalAPI.patch(`/${requestId}/complete`, {
              newMileage,
              notes
          });
          showToast("Devolução registrada e KM atualizada!", "success");
          setReturnModalOpen(false);
          setRequestToReturn(null);
          load(); 
      } catch (err) {
          console.error(err);
          const errorMessage = err.response?.data?.error || 'Erro ao finalizar devolução.';
          showToast(errorMessage, 'error');
      }
  };
  
  const viewDetails = (req) => {
      setSelected({ ...req, action: 'view' });
  };
  
  const openReturnModal = (req) => {
      setRequestToReturn(req);
      setReturnModalOpen(true);
  };

  const handleReset = async () => {
    if (window.confirm("ATENÇÃO: Deseja realmente excluir TODAS as solicitações? Esta ação é IRREVERSÍVEL.")) {
      setResetting(true);
      try {
        const res = await rentalAPI.delete('/reset-all');
        showToast(res.data.message, 'success');
        load();
      } catch (error) {
        showToast('Erro ao resetar solicitações.', 'error');
      } finally {
        setResetting(false);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen w-full">
        <Loading />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full flex justify-center">
      
     
      <div className="max-w-6xl w-full bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        
       
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-5 border-b border-gray-200 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                  <FontAwesomeIcon icon={faListAlt} className="text-blue-600 w-7 h-7" />
                  Gerenciar Solicitações
              </h1>
              <p className="mt-1 text-sm text-gray-500 ml-10">Controle completo dos pedidos de aluguel.</p>
            </div>
            
            <button
              onClick={handleReset}
              disabled={resetting || loading}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all ${resetting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {resetting ? 'Resetando...' : 'Resetar Banco de Dados'}
            </button>
        </div>

       
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl flex-wrap justify-center sm:justify-start">
                {['pending', 'approved', 'rejected', 'completed', 'all'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            filter === s 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-600 hover:bg-gray-200 bg-white border border-gray-200'
                        }`}
                    >
                        {statusLabels[s]?.label || 'Todas'}
                    </button>
                ))}
            </div>

            <div className="relative w-full sm:w-64">
                <input
                    type="text"
                    placeholder="Buscar usuário ou carro..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
        </div>

       
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            
         
            <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-left border-collapse divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700">
                                <FontAwesomeIcon icon={faUser} className="mr-1" /> Usuário
                            </th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700">
                                <FontAwesomeIcon icon={faCar} className="mr-1" /> Veículo
                            </th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Período
                            </th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Finalidade
                            </th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700 text-center">
                                Status / Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length > 0 ? (
                            filtered.map((req) => (
                                <tr key={req._id} className="hover:bg-blue-50 transition duration-150">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-900">{req.user?.name}</div>
                                        <div className="text-xs text-gray-500">{req.user?.email}</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900">{req.vehicle?.model}</div>
                                        <div className="text-xs font-mono text-gray-500">{req.vehicle?.licensePlate}</div>
                                    </td>
                                    
                                    <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                                        {formatRentalPeriod(req.startDate, req.endDate)}
                                    </td>

                                    <td className="p-4 max-w-xs truncate text-sm text-gray-700" title={req.purpose}>
                                        {req.purpose}
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-center text-sm font-medium">
                                       
                                        <div className="mb-2">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm border ${statusColors[req.status]}`}>
                                                <FontAwesomeIcon icon={statusLabels[req.status]?.icon} className="mr-1 w-3 h-3" />
                                                {statusLabels[req.status]?.label}
                                            </span>
                                        </div>

                                        {/* Ações */}
                                        <div className="flex justify-center gap-2">
                                            {req.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => setSelected({ ...req, action: 'approved' })}
                                                        className="text-green-600 hover:text-green-800 text-xs font-bold uppercase transition-colors"
                                                    >
                                                        Aprovar
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => setSelected({ ...req, action: 'rejected' })}
                                                        className="text-red-600 hover:text-red-800 text-xs font-bold uppercase transition-colors"
                                                    >
                                                        Rejeitar
                                                    </button>
                                                </>
                                            )}
                                            
                                            {req.status === 'approved' && (
                                                <button
                                                    onClick={() => openReturnModal(req)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-1"
                                                >
                                                    <FontAwesomeIcon icon={faClipboardCheck} />
                                                    Concluir
                                                </button>
                                            )}
                                            
                                            {req.status === 'completed' && req.adminNotes && req.adminNotes.trim().length > 0 && (
                                                <button
                                                    onClick={() => viewDetails(req)}
                                                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                    title="Ver Detalhes"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-gray-400">
                                    Nenhuma solicitação encontrada para o filtro atual.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

          
            <div className="lg:hidden p-4 space-y-4 bg-gray-50">
                {filtered.map((req) => (
                    <div key={req._id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                         <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-md font-bold text-gray-900">{req.vehicle?.model}</h3>
                                <p className="text-xs text-gray-500 font-mono">{req.vehicle?.licensePlate}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full border ${statusColors[req.status]}`}>
                                <FontAwesomeIcon icon={statusLabels[req.status]?.icon} className="mr-1 w-3 h-3" />
                                {statusLabels[req.status]?.label}
                            </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-700 flex justify-between">
                                <span className="font-semibold text-gray-500">Usuário:</span> 
                                <span>{req.user?.name}</span>
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="block font-semibold text-gray-500 text-xs uppercase mb-1">Período:</span>
                                {formatRentalPeriod(req.startDate, req.endDate)}
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold text-gray-500">Finalidade:</span> <br/>
                                <span className="italic text-gray-600">{req.purpose}</span>
                            </p>
                        </div>

                        {/* Ações Mobile */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                             {req.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => setSelected({ ...req, action: 'approved' })}
                                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold border border-green-200"
                                    >
                                        Aprovar
                                    </button>
                                    <button
                                        onClick={() => setSelected({ ...req, action: 'rejected' })}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold border border-red-200"
                                    >
                                        Rejeitar
                                    </button>
                                </>
                             )}
                             {req.status === 'approved' && (
                                <button
                                    onClick={() => openReturnModal(req)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md"
                                >
                                    Marcar como Concluído
                                </button>
                             )}
                             {req.status === 'completed' && req.adminNotes && (
                                <button
                                    onClick={() => viewDetails(req)}
                                    className="text-blue-600 text-sm font-semibold"
                                >
                                    Ver Detalhes
                                </button>
                             )}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                  <div className="text-center py-8 text-gray-400 bg-white rounded-lg border-dashed border-2 border-gray-300">
                      Nenhuma solicitação encontrada.
                  </div>
                )}
            </div>

        </div>
      </div>

  
      <ReturnModal 
        isOpen={returnModalOpen}
        request={requestToReturn}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleCompleteRental}
      />

    
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
            
            {selected.action === 'view' ? ( 
                <>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                      Detalhes da Solicitação
                    </h2>
                    <div className="space-y-3 mb-6">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-800">Veículo:</span> {selected.vehicle?.model}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-800">Solicitante:</span> {selected.user?.name}
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-xs uppercase text-gray-500 mb-2">Observações / Notas:</h3>
                            <p className="text-gray-800 text-sm whitespace-pre-wrap">
                               {selected.adminNotes || 'Nenhuma observação registrada.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setSelected(null)}
                            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition font-medium"
                        >
                            Fechar
                        </button>
                    </div>
                </>
            ) : ( 
                <>
                    <h2 className={`text-xl font-bold mb-4 ${selected.action === "approved" ? "text-green-700" : "text-red-700"}`}>
                      {selected.action === "approved" ? "Aprovar Solicitação" : "Rejeitar Solicitação"}
                    </h2>

                    <p className="text-gray-600 mb-4 text-sm">
                      Você confirma a ação para o veículo <b>{selected.vehicle?.model}</b> solicitado por
                      <b> {selected.user?.name}</b>?
                    </p>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicionar observação (opcional)..."
                      className="w-full border border-gray-300 rounded-lg p-3 h-24 mb-6 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                    />

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {setSelected(null); setNotes('');}}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition font-medium"
                        disabled={saving}
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={() => updateStatus(selected.action)}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg text-white font-bold shadow-md transition ${
                            selected.action === 'approved' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {saving ? "Salvando..." : "Confirmar"}
                      </button>
                    </div>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}