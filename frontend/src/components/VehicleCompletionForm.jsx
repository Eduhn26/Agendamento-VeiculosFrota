import React, { useState } from 'react';
import { rentalAPI } from '../services/api';
import Loading from '../components/Loading';

const VehicleCompletionForm = ({ request, onClose, onCompletionSuccess, onNotification }) => {
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentVehicleKM = request.vehicle?.mileage || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const newMileage = parseInt(mileage, 10);

    if (isNaN(newMileage) || newMileage <= 0) {
        setError('Por favor, insira uma quilometragem válida.');
        return;
    }

    if (newMileage < currentVehicleKM) {
        setError(`A KM atual (${newMileage.toLocaleString()} km) não pode ser inferior à última registrada (${currentVehicleKM.toLocaleString()} km).`);
        return;
    }

    setLoading(true);
    
    try {
      const response = await rentalAPI.patch(`/${request._id}/complete`, {
        newMileage,
        notes,
      });

      onCompletionSuccess(response.data);
      onNotification('Devolução finalizada e KM atualizada!', 'success');
      onClose();

    } catch (err) {
      const rawError = err.response?.data?.error;
      
      let errorMessage;
      if (typeof rawError === 'string') {
          errorMessage = rawError;
      } else if (rawError && typeof rawError.message === 'string') {
          errorMessage = rawError.message;
      } else {
          errorMessage = 'Erro desconhecido ao finalizar a devolução.';
      }
      
      setError(errorMessage); 
      onNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 transform transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
          Finalizar Devolução
        </h2>

        <p className="text-gray-600 mb-4 text-sm">
          Informe a quilometragem atual do {request.vehicle?.model} para concluir o aluguel.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
            <p className="font-medium text-gray-700">KM Anterior Registrada:</p>
            <p className="font-bold text-lg text-blue-800">
              {currentVehicleKM.toLocaleString()} km
            </p>
          </div>

          <div>
            <label htmlFor="mileage" className="block text-sm font-semibold text-gray-900 mb-1">
              Quilometragem Atual do Veículo *
            </label>
            <input
              id="mileage"
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              required
              min={currentVehicleKM + 1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder={`Insira a KM (deve ser maior que ${currentVehicleKM.toLocaleString()})`}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              id="notes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: O carro está com a luz do óleo acesa ou sem observações."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? <Loading /> : 'Concluir Devolução'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleCompletionForm;
