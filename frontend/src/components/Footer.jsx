import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarSide, faEnvelope, faPhone, faClock } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
      
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            
              <FontAwesomeIcon icon={faCarSide} className="text-white text-base" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Agendamentos Frota</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md">
            Sistema inteligente de gerenciamento de frota veicular. 
            Otimizando a mobilidade e logística da sua empresa.
          </p>
        </div>

     
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Navegação</h4>
          <div className="space-y-2 text-sm">
            <div>
              <a href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Meu Painel
              </a>
            </div>
            <div>
              <a href="/history" className="text-gray-600 hover:text-blue-600 transition-colors">
                Histórico
              </a>
            </div>
            <div>
              <a href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                Administração
              </a>
            </div>
          </div>
        </div>

      
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Suporte</h4>
          <div className="space-y-2 text-sm">
            
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 flex items-center justify-center">
              
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 w-4 h-4" />
              </div>
              <span>suporte@frotamanager.com</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 flex items-center justify-center">
              
                <FontAwesomeIcon icon={faPhone} className="text-gray-500 w-4 h-4" />
              </div>
              <span>(11) 3456-7890</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 flex items-center justify-center">
              
                <FontAwesomeIcon icon={faClock} className="text-gray-500 w-4 h-4" />
              </div>
              <span>Seg - Sex: 8h às 18h</span>
            </div>
          </div>
        </div>
      </div>

     
      <div className="w-full bg-gray-100 border-t border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
            <p className="text-xs text-gray-500">
              © {currentYear} FrotaManager. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                Privacidade
              </a>
              <a href="/terms" className="hover:text-gray-700 transition-colors">
                Termos
              </a>
              <a href="/help" className="hover:text-gray-700 transition-colors">
                Ajuda
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;