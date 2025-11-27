import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { 
  faCogs, 
  faTachometerAlt, 
  faUsers, 
  faGasPump,
  faIdCard,      
  faCalendarAlt  
} from '@fortawesome/free-solid-svg-icons'; 


import yarisImg from '../assets/vehicles/toyota-yaris.png';
import poloImg from '../assets/vehicles/vw-polo.png';
import compassImg from '../assets/vehicles/jeep-compass.png';
import etiosImg from '../assets/vehicles/toyota-etios.png';
import defaultImg from '../assets/vehicles/default-car.png'; 

const VehicleCard = ({ vehicle, onSelect }) => {
  
  const isAvailable = vehicle.status === 'available';
  
  const getVehicleImage = () => {
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

  const imageSource = getVehicleImage();

  const transmission = vehicle.transmissionType === 'automatic' ? 'Automático' : 'Manual';
  const fuel = vehicle.fuelType || 'Flex'; 
  const passengers = vehicle.passengers || 5;

  let statusBadgeText = 'Indisponível';
  let statusBadgeClasses = 'bg-gray-100 text-gray-800 border-gray-200';

  if (isAvailable) {
      statusBadgeText = 'Disponível';
      statusBadgeClasses = 'bg-green-100 text-green-800 border-green-200';
  } else if (vehicle.status === 'maintenance') {
      statusBadgeText = 'Manutenção';
      statusBadgeClasses = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else if (vehicle.status === 'rented') {
      statusBadgeText = 'Alugado';
      statusBadgeClasses = 'bg-blue-100 text-blue-800 border-blue-200';
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col transition duration-300 hover:shadow-lg border border-gray-200 hover:border-blue-600 relative group">
      
   
      <div className="w-full h-48 bg-gray-100 flex justify-center items-center relative overflow-hidden"> 
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
            <h3 className="text-lg font-bold leading-tight mb-0.5 bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent pr-2">
                {vehicle.brand} {vehicle.model}
            </h3>
          
            <span className={`inline-flex items-center font-semibold rounded-full border px-2 py-0.5 text-xs shadow-sm shrink-0 ${statusBadgeClasses}`}>
                {statusBadgeText}
            </span>
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

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm py-2 border-y border-gray-100 mb-3">
          <div className="flex items-center gap-1.5 font-semibold">
            <FontAwesomeIcon icon={faTachometerAlt} className="text-blue-600 text-base" />
            <span className="text-gray-600">
                {vehicle.mileage.toLocaleString()} km
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-base" />
            <span className="text-gray-600">{passengers} lug.</span> 
          </div>
          
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faGasPump} className="text-blue-600 text-base" />
            <span className="text-gray-600">{fuel}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faCogs} className="text-blue-600 text-base" />
            <span className="text-gray-600">{transmission}</span>
          </div>
        </div>
        
        <div className="card-actions-new mt-auto pt-2">
          <button 
            className={`w-full px-4 py-2.5 font-semibold rounded-lg transition duration-150 transform hover:scale-[1.01] shadow-md ${
                isAvailable 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/50' 
                : 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none'
            }`}
            onClick={() => isAvailable && onSelect && onSelect(vehicle)}
            disabled={!isAvailable}
          >
              {isAvailable ? 'Selecionar Veículo' : 'Indisponível'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;