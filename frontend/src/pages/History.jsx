import React, { useEffect, useState } from "react";
import { rentalAPI } from "../services/api";
import Loading from "../components/Loading";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faHistory, faClock, faCheckCircle, faTimesCircle, faCircleCheck, faCar, faCalendarDay, faCalendarDays } from '@fortawesome/free-solid-svg-icons'; 
import VehicleCompletionForm from "../components/VehicleCompletionForm"; 
import { useToast } from '../context/ToastContext'; 


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
                    <span className="text-right">{startDatePart} às {startTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="font-semibold flex items-center gap-2 text-gray-600">
                         <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-red-500" />
                        Devolução:
                    </span>
                    <span className="text-right">{endDatePart} às {endTime}</span>
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


const History = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const { showToast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await rentalAPI.get("/my-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletionSuccess = (updatedRequest) => {
    setRequests(prev => prev.map(r => r._id === updatedRequest._id ? updatedRequest : r));
    setSelectedRequest(null);
  };

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

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen w-full">
            <Loading />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full flex justify-center"> 
      
      <div className="max-w-4xl w-full bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
            <FontAwesomeIcon icon={faHistory} className="text-blue-600 w-7 h-7" />
            Histórico de Solicitações
        </h1>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          
          
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full text-left border-collapse divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Veículo</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Período</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700">Finalidade</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700 text-center">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-700 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-blue-50 transition duration-150">
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{req.vehicle?.brand} {req.vehicle?.model}</div>
                      <div className="text-sm text-gray-500 font-mono">{req.vehicle?.licensePlate}</div>
                    </td>

                    <td className="p-4 text-sm text-gray-700 whitespace-nowrap">
                       {formatRentalPeriod(req.startDate, req.endDate)}
                    </td>

                    <td className="p-4 text-sm text-gray-700 max-w-xs truncate" title={req.purpose}>
                      {req.purpose}
                    </td>

                    <td className="p-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm border ${
                          statusColors[req.status] || 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={statusLabels[req.status]?.icon} className="mr-1 w-3 h-3" />
                        {statusLabels[req.status]?.label}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                        {req.status === 'approved' && (
                            <button
                                onClick={() => setSelectedRequest(req)}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-md"
                            >
                                Finalizar Devolução
                            </button>
                        )}
                        {req.status !== 'approved' && (
                             <span className="text-gray-400 text-xs">Sem ação</span>
                        )}
                    </td>
                  </tr>
                ))}

                {requests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400">
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


          
          <div className="lg:hidden p-4 space-y-4">
              {requests.map((req) => (
                  <div key={req._id} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2 border-b pb-2">
                          <h3 className="text-md font-bold text-gray-900">
                              {req.vehicle?.brand} {req.vehicle?.model}
                          </h3>
                          <span
                              className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                                  statusColors[req.status] || 'bg-gray-100 text-gray-700 border-gray-300'
                              }`}
                          >
                              <FontAwesomeIcon icon={statusLabels[req.status]?.icon} className="mr-1 w-3 h-3" />
                              {statusLabels[req.status]?.label}
                          </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                          <strong className="font-semibold">Placa:</strong> <span className="font-mono">{req.vehicle?.licensePlate}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                          <strong className="font-semibold">Período:</strong> {formatDisplayDate(req.startDate)} — {formatDisplayDate(req.endDate)}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                          <strong className="font-semibold">Finalidade:</strong> {req.purpose}
                      </p>
                      {req.status === 'approved' && (
                          <div className="flex justify-end">
                              <button
                                  onClick={() => setSelectedRequest(req)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-md"
                              >
                                  Finalizar Devolução
                              </button>
                          </div>
                      )}
                  </div>
              ))}
              
              {requests.length === 0 && (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-dashed border-2 border-gray-300">
                      Nenhuma solicitação encontrada.
                  </div>
              )}
          </div>

        </div>
      </div>
      
      {selectedRequest && (
        <VehicleCompletionForm 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onCompletionSuccess={handleCompletionSuccess}
          onNotification={showToast} 
        />
      )}
    </div>
  );
};

export default History;