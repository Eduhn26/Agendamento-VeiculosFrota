import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="text-lg font-semibold text-gray-600 animate-pulse">Carregando...</div>
    </div>
  );
};

export default Loading;