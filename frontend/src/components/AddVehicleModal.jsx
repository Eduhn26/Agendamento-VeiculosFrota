import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { vehicleAPI } from '../services/api'; 
import Loading from './Loading'; 

const AddVehicleModal = ({ isOpen, onClose, onSuccess, onNotification }) => {
    
   
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        color: '',
        mileage: 0,
        transmissionType: 'automatic',
        fuelType: 'Flex',
        passengers: 5,
        imageUrl: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        
        if (!formData.brand || !formData.model || !formData.licensePlate || !formData.color) {
            setError('Preencha todos os campos obrigatórios (Marca, Modelo, Placa e Cor).');
            setLoading(false);
            return;
        }

        
        const dataToSend = { ...formData };
        if (dataToSend.imageUrl) {
            dataToSend.imageUrl = dataToSend.imageUrl.trim(); 
        }
        
        try {
           
            const res = await vehicleAPI.post('/', dataToSend);
            
           
            onSuccess(res.data);
            onNotification({ message: 'Veículo cadastrado com sucesso!', type: 'success' });
            
           
            setFormData({
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                licensePlate: '',
                color: '',
                mileage: 0,
                transmissionType: 'automatic',
                fuelType: 'Flex',
                passengers: 5,
                imageUrl: '',
            });

        } catch (err) {
            console.error('Erro ao cadastrar veículo:', err);
            const errorMessage = err.response?.data?.error || 'Erro ao cadastrar veículo. Verifique os dados.';
            setError(errorMessage);
            onNotification({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                
                {/* Header do Modal */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon="car-side" />
                        Cadastro de Novo Veículo
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                        <FontAwesomeIcon icon="times" size="lg" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Erro:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        
                        {/* Marca */}
                        <div className="col-span-1">
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                            <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                        
                        {/* Modelo */}
                        <div className="col-span-1">
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                            <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Ano */}
                        <div className="col-span-1">
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                            <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} min="1900" max={new Date().getFullYear() + 1}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        
                        {/* Placa */}
                        <div className="col-span-1">
                            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                            <input type="text" id="licensePlate" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required maxLength="8"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                            />
                        </div>
                        
                        {/* Cor */}
                        <div className="col-span-1">
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Cor *</label>
                            <input type="text" id="color" name="color" value={formData.color} onChange={handleChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Quilometragem */}
                        <div className="col-span-1">
                            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">KM Inicial</label>
                            <input type="number" id="mileage" name="mileage" value={formData.mileage} onChange={handleChange} min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                        
                        {/* Passageiros */}
                        <div className="col-span-1">
                            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">Passageiros</label>
                            <input type="number" id="passengers" name="passengers" value={formData.passengers} onChange={handleChange} min="1" max="9"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        
                        {/* Transmissão */}
                        <div className="col-span-1">
                            <label htmlFor="transmissionType" className="block text-sm font-medium text-gray-700 mb-1">Transmissão</label>
                            <select id="transmissionType" name="transmissionType" value={formData.transmissionType} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                            >
                                <option value="automatic">Automático</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        
                        {/* Combustível */}
                        <div className="col-span-1">
                            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Combustível</label>
                            <input type="text" id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    
                    {/* URL da Imagem */}
                    <div className="mb-8">
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Opcional)</label>
                        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Ex: https://caminho.com/imagem-do-carro.png"
                        />
                         <p className="text-xs text-gray-500 mt-1">Se deixado em branco, será usada uma imagem padrão.</p>
                    </div>

                    {/* Footer / Botões */}
                    <div className="bg-gray-50 px-6 py-4 -mx-6 -mb-8 sm:-mx-8 border-t border-gray-100 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center gap-2"
                        >
                            {loading ? <Loading size="sm" /> : <FontAwesomeIcon icon="plus" />}
                            {loading ? 'Cadastrando...' : 'Cadastrar Veículo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleModal;