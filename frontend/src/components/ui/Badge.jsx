import React from 'react';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-700' },
  available: { label: 'Disponível', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'Manutenção', color: 'bg-yellow-100 text-yellow-700' },
  rented: { label: 'Alugado', color: 'bg-blue-100 text-blue-700' }
};

const Badge = ({ status }) => {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase shadow-sm ${config.color}`}>
      {config.label}
    </span>
  );
};

export default Badge;