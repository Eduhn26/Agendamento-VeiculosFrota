import { useToast } from "../context/ToastContext";
import React from 'react';

const typeClassesMap = {
  success: 'bg-green-600 text-white border-green-800',
  error: 'bg-red-600 text-white border-red-800',
  default: 'bg-blue-600 text-white border-blue-800'
};

const iconMap = {
    success: '✅',
    error: '❌',
    default: '💡'
};

export default function ToastNotification() {
  const { message, type, visible } = useToast();

  const baseClasses = "fixed top-5 right-5 z-[9999] p-4 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-500 ease-in-out transform border-l-4";
  
  const currentTypeClasses = typeClassesMap[type] || typeClassesMap.default;

  return (
    <div 
      className={`${baseClasses} ${currentTypeClasses} ${
        visible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0 pointer-events-none'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-xl">{iconMap[type] || iconMap.default}</span>
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}