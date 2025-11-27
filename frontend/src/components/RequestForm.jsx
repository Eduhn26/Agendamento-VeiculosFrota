import React, { useState } from 'react';
import { rentalAPI } from '../services/api';


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

const formatDateLocal = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- LÓGICA DE STATUS DO DIA ---
const getStatusForDate = (date, bookings) => {
  const dateStr = formatDateLocal(date);
  const todayStr = formatDateLocal(new Date());

  if (dateStr < todayStr) return 'past';
  
  if (!bookings || bookings.length === 0) return 'available';

  const dayStart = new Date(dateStr + 'T00:00:00');
  const dayEnd = new Date(dateStr + 'T23:59:59');

  const isFullyBooked = bookings.some(booking => {
    const bStart = new Date(booking.startDate);
    const bEnd = new Date(booking.endDate);
    return bStart <= dayStart && bEnd >= dayEnd;
  });

  if (isFullyBooked) return 'blocked';

  return 'available';
};

const getDatesInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const dates = [];
  while (date.getMonth() === month) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};
const timeOptions = generateTimeOptions();


// --- LÓGICA DE FORMATAÇÃO DE HORÁRIOS PARA EXIBIÇÃO ---
const getBookedSlotsForSelectedDay = (dateStr, approvedBookings) => {
  if (!dateStr || !approvedBookings) return [];
  
  const formatTimeWithDateContext = (dateObj, currentSelectedDateStr) => {
      const thisDateStr = formatDateLocal(dateObj);
      const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Se a data do evento for igual a data clicada no calendário, mostra só a hora
      if (thisDateStr === currentSelectedDateStr) {
          return timeStr;
      }
      // Se for diferente, mostra "DD/MM HH:MM"
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      return `${day}/${month} ${timeStr}`;
  };

  return approvedBookings
    .filter(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const selectedDay = new Date(dateStr + 'T00:00:00'); 
      const nextDay = new Date(selectedDay);
      nextDay.setDate(nextDay.getDate() + 1);

      return start < nextDay && end > selectedDay;
    })
    .map(booking => {
      const startObj = new Date(booking.startDate);
      const endObj = new Date(booking.endDate);
      
      return {
        startDisplay: formatTimeWithDateContext(startObj, dateStr),
        endDisplay: formatTimeWithDateContext(endObj, dateStr),
        label: 'Reservado' 
      };
    })
    .sort((a, b) => {
        return a.startDisplay.localeCompare(b.startDisplay);
    });
};

const checkTimeOverlap = (newStart, newEnd, bookings) => {
    const start = new Date(newStart);
    const end = new Date(newEnd);

    return bookings.some(booking => {
        const bookedStart = new Date(booking.startDate);
        const bookedEnd = new Date(booking.endDate);
        return start < bookedEnd && end > bookedStart;
    });
};


const RequestForm = ({ vehicle, approvedBookings, onSuccess, onCancel, onNotification }) => {
  const [formData, setFormData] = useState({
    vehicleId: vehicle._id,
    startDate: '',
    endDate: '',
    purpose: ''
  });
  
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('18:00');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const handleDateClick = (date) => {
    const dateStr = formatDateLocal(date);
    const dayStatus = getStatusForDate(date, approvedBookings);

    if (dayStatus !== 'available') return;

    const start = formData.startDate;
    const end = formData.endDate;

    if (!start || (start && end && start !== end) || dateStr < start) {
      setFormData(prev => ({ ...prev, startDate: dateStr, endDate: dateStr }));
      setStartHour('08:00');
      setEndHour('18:00');
      setError('');
      return;
    }

    if (start && end && start === end && dateStr === start) {
      setFormData(prev => ({ ...prev, startDate: '', endDate: '' }));
      setError('');
      return;
    }

    if (start && end && start === end && dateStr > start) {
      
      let curr = new Date(start);
      curr.setDate(curr.getDate() + 1); 
      const target = new Date(dateStr);
      
      let hasBlockedDay = false;
      while (curr <= target) {
          if (getStatusForDate(curr, approvedBookings) === 'blocked') {
              hasBlockedDay = true;
              break;
          }
          curr.setDate(curr.getDate() + 1);
      }

      if (hasBlockedDay) {
          setError('O intervalo selecionado conflita com dias indisponíveis (vermelhos).');
          return;
      }

      const startObj = new Date(start + 'T00:00:00');
      const endObj = new Date(dateStr + 'T00:00:00');
      const diffTime = Math.abs(endObj - startObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 5) {
        setError('O período máximo de aluguel é de 5 dias.');
        return;
      }

      setFormData(prev => ({ ...prev, endDate: dateStr }));
      setError('');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };
  
  const handleHourChange = (setter) => (e) => {
      setter(e.target.value);
      if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.startDate || !formData.purpose) {
      setError('Por favor, selecione as datas e preencha a finalidade.');
      setLoading(false);
      return;
    }

    const finalStartDate = `${formData.startDate}T${startHour}:00`;
    const finalEndDate = `${formData.endDate}T${endHour}:00`;

    const startObj = new Date(finalStartDate);
    const endObj = new Date(finalEndDate);

    if (startObj >= endObj) {
      setError('A Data/Hora de Devolução deve ser posterior à Data/Hora de Retirada.');
      setLoading(false);
      return;
    }
    
    const maxDurationMs = 5 * 24 * 60 * 60 * 1000;
    const durationMs = endObj.getTime() - startObj.getTime();

    if (durationMs > maxDurationMs) {
         setError('O período máximo de aluguel é de 5 dias (incluindo horas).');
         setLoading(false);
         return;
    }

    const hasConflict = checkTimeOverlap(finalStartDate, finalEndDate, approvedBookings);
    
    if (hasConflict) {
        const conflictBooking = approvedBookings.find(b => {
             const bStart = new Date(b.startDate);
             const bEnd = new Date(b.endDate);
             return startObj < bEnd && endObj > bStart;
        });

        const conflictStart = new Date(conflictBooking.startDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        const conflictEnd = new Date(conflictBooking.endDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        
        setError(`Conflito de horário! O veículo está ocupado neste dia das ${conflictStart} às ${conflictEnd}. Por favor ajuste os horários.`);
        setLoading(false);
        return;
    }

    try {
      const payload = {
          vehicleId: formData.vehicleId,
          startDate: finalStartDate, 
          endDate: finalEndDate,     
          purpose: formData.purpose
      };
      
      const response = await rentalAPI.post('', payload);
      onSuccess(response.data);

      if (onNotification)
        onNotification({ message: 'Solicitação enviada com sucesso!', type: 'success' });

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao enviar solicitação.';
      setError(errorMessage);

      if (onNotification)
        onNotification({ message: errorMessage, type: 'error' });

    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = getDatesInMonth(calendarYear, calendarMonth);
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthName = new Date(calendarYear, calendarMonth).toLocaleString('pt-BR', { month: 'long' });

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('/');
  };
  
  const totalDays = formData.startDate && formData.endDate
    ? Math.ceil((new Date(formData.endDate + 'T00:00:00') - new Date(formData.startDate + 'T00:00:00')) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
  
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Solicitar Reserva
            </h2>
            <p className="text-blue-100 text-sm">
              {vehicle.brand} {vehicle.model} • {vehicle.licensePlate}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <div>
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
          <div className="space-y-6">
           
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <button 
                type="button"
                onClick={() => {
                  const newDate = new Date(calendarYear, calendarMonth - 1, 1);
                  setCalendarMonth(newDate.getMonth());
                  setCalendarYear(newDate.getFullYear());
                  setError('');
                }}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800"
              >
                ‹
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {monthName} {calendarYear}
              </h3>
              
              <button 
                type="button"
                onClick={() => {
                  const newDate = new Date(calendarYear, calendarMonth + 1, 1);
                  setCalendarMonth(newDate.getMonth());
                  setCalendarYear(newDate.getFullYear());
                  setError('');
                }}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800"
              >
                ›
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              
              <div className="grid grid-cols-7 gap-1 mb-3">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

           
              <div className="grid grid-cols-7 gap-1">
                {[...Array(firstDayOfWeek)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-10"></div>
                ))}

                {daysInMonth.map(date => {
                  const status = getStatusForDate(date, approvedBookings);
                  const dateStr = formatDateLocal(date);
                  const isSelectedStart = dateStr === formData.startDate;
                  const isSelectedEnd = dateStr === formData.endDate;
                  let inRange = false;

                  if (formData.startDate && formData.endDate) {
                    if (dateStr > formData.startDate && dateStr < formData.endDate) inRange = true;
                  }

                  const getDayClasses = () => {
                    const baseClasses = "h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all cursor-pointer border-2 border-transparent";
                    
                    if (status === 'past') {
                      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
                    }
                    
                    if (status === 'blocked') {
                        return `${baseClasses} bg-red-100 text-red-400 cursor-not-allowed font-normal`;
                    }

                    if (isSelectedStart || isSelectedEnd) {
                      return `${baseClasses} bg-blue-600 text-white border-blue-700 shadow-lg scale-105`;
                    }

                    if (inRange) {
                      return `${baseClasses} bg-blue-500 text-white`;
                    }

                    return `${baseClasses} bg-green-600 text-white hover:bg-green-700 border-green-700`; 
                  };

                  return (
                    <div
                      key={dateStr}
                      className={getDayClasses()}
                      onClick={() => handleDateClick(date)}
                      title={status === 'blocked' ? 'Indisponível (Reservado)' : status === 'past' ? 'Data passada' : 'Disponível'}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEÇÃO DE HORÁRIOS ATUALIZADA (LISTA SIMPLIFICADA) */}
            {formData.startDate && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2 text-sm">
                  <span>🚫</span>
                  Horários Ocupados - {formatDisplayDate(formData.startDate)}
                </h4>
                
                {getBookedSlotsForSelectedDay(formData.startDate, approvedBookings).length > 0 ? (
                  <ul className="space-y-1">
                    {getBookedSlotsForSelectedDay(formData.startDate, approvedBookings).map((slot, index) => (
                      <li key={index} className="text-xs text-red-800 border-b border-red-200 last:border-0 py-1 flex items-center gap-2">
                         <span className="font-bold">
                            {slot.startDisplay} — {slot.endDisplay}
                         </span>
                         <span className="opacity-75 italic text-[10px] uppercase tracking-wide">
                            - Reservado
                         </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-700 text-xs">Nenhuma reserva parcial para este dia.</p>
                )}
              </div>
            )}
          
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legenda:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 border-2 border-green-700 rounded"></div>
                      <span className="text-gray-600">Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded"></div>
                      <span className="text-gray-600">Totalmente Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
                      <span className="text-gray-600">Passado</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Período Selecionado:</h4>
                  <div className="space-y-1 text-gray-600">
                    {formData.startDate ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">Início</Badge>
                        <span>{formatDisplayDate(formData.startDate)}</span>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Selecione a data inicial</p>
                    )}
                    
                    {formData.endDate ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">Término</Badge>
                        <span>{formatDisplayDate(formData.endDate)}</span>
                      </div>
                    ) : formData.startDate ? (
                      <p className="text-gray-400 text-sm">Selecione a data final</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

       
          <div className="space-y-6">
          
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-blue-600">🚗</span>
                Informações do Veículo
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Modelo:</span>
                  <p className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</p>
                </div>
                <div>
                  <span className="text-gray-600">Ano/Placa:</span>
                  <p className="font-semibold text-gray-900">{vehicle.year} • {vehicle.licensePlate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Quilometragem:</span>
                  <p className="font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <span className="text-gray-600">Transmissão:</span>
                  <p className="font-semibold text-gray-900">
                    {vehicle.transmissionType === 'automatic' ? 'Automático' : 'Manual'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-gray-600">⏰</span>
                Horários de Retirada e Devolução
              </h3>
              {formData.startDate ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startHour" className="block text-xs font-semibold text-gray-700 mb-1">
                        Retirada ({formatDisplayDate(formData.startDate)}):
                      </label>
                      <select
                        id="startHour"
                        value={startHour}
                        onChange={handleHourChange(setStartHour)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="endHour" className="block text-xs font-semibold text-gray-700 mb-1">
                        Devolução ({formatDisplayDate(formData.endDate)}):
                      </label>
                      <select
                        id="endHour"
                        value={endHour}
                        onChange={handleHourChange(setEndHour)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
              ) : (
                <p className='text-sm text-gray-500'>Selecione as datas no calendário para escolher os horários.</p>
              )}
            </div>
            
            <div className="space-y-3">
              <label htmlFor="purpose" className="block text-sm font-semibold text-gray-900">
                Finalidade do Aluguel *
              </label>
              <textarea
                id="purpose"
                name="purpose"
                rows="3" 
                value={formData.purpose}
                onChange={handleFormChange}
                required
                placeholder="Descreva a finalidade do aluguel. Ex: Viagem de negócios para reunião em São Paulo..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                Forneça detalhes sobre o uso do veículo para melhor análise da solicitação.
              </p>
            </div>

          
            {(formData.startDate || formData.endDate) && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  Resumo da Reserva
                </h4>
                <div className="space-y-2 text-sm">
                  {formData.startDate && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Retirada:</span>
                      <span className="font-semibold text-green-900">{formatDisplayDate(formData.startDate)} às {startHour}</span>
                    </div>
                  )}
                  {formData.endDate && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Devolução:</span>
                      <span className="font-semibold text-green-900">{formatDisplayDate(formData.endDate)} às {endHour}</span>
                    </div>
                  )}
                  {formData.startDate && formData.endDate && (
                    <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                      <span className="text-green-700 font-semibold">Total de dias (Aproximado):</span>
                      <span className="font-bold text-green-900">
                        {totalDays} {totalDays === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !formData.startDate || !formData.purpose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando solicitação...
                  </>
                ) : (
                  <>
                    <span>📨</span>
                    Enviar Solicitação
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancelar
              </button>
            </div>

           
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-600 text-sm">💡</span>
                </div>
                <div>
                  <p className="text-yellow-800 text-sm font-medium">Informações importantes</p>
                  <ul className="text-yellow-700 text-xs mt-1 space-y-1">
                    <li>• Para aluguel de 1 dia, basta **um clique** na data desejada. Um segundo clique na mesma data limpa a seleção.</li>
                    <li>• **Dias em vermelho** indicam que o veículo está ocupado o dia inteiro.</li>
                    <li>• O horário de retirada e devolução é obrigatório para checagem de conflitos.</li>
                    <li>• Período máximo de aluguel: 5 dias.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;