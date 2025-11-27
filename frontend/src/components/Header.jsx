import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie,       
  faCar,            
  faClipboardList,  
  faHome,           
  faHistory,
  faSignOutAlt, 
  faUserCircle, 
  faBars,       
  faTimes,     
  faCarSide     
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = isAdmin
    ? [
        { 
          to: "/admin", 
          label: "Dashboard", 
          icon: <FontAwesomeIcon icon={faChartPie} className="w-5 h-5" /> 
        },
        { 
          to: "/admin/vehicles", 
          label: "Frota", 
          icon: <FontAwesomeIcon icon={faCar} className="w-5 h-5" /> 
        },
        { 
          to: "/admin/requests", 
          label: "Solicitações", 
          icon: <FontAwesomeIcon icon={faClipboardList} className="w-5 h-5" /> 
        },
      ]
    : [
        { 
          to: "/dashboard", 
          label: "Meu Painel", 
          icon: <FontAwesomeIcon icon={faHome} className="w-5 h-5" /> 
        },
        { 
          to: "/history", 
          label: "Histórico", 
          icon: <FontAwesomeIcon icon={faHistory} className="w-5 h-5" /> 
        }
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
       
          <div className="flex items-center">
            <Link 
              to={isAdmin ? "/admin" : "/dashboard"} 
              className="flex items-center space-x-2 group"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-blue-200 shadow-md group-hover:scale-105 transition-transform duration-200">
               
                <FontAwesomeIcon icon={faCarSide} className="text-white text-lg" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                Agendamentos Frota
              </span>
            </Link>
          </div>

          
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.to)
                    ? "text-blue-700 bg-blue-50 ring-1 ring-blue-100"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

         
          <div className="flex items-center space-x-4">
            
          
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-gray-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-gray-800 leading-none">
                  {user?.name.split(" ")[0]}
                </span>
                <span className="text-xs text-gray-500 capitalize mt-0.5">
                  {user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
                </span>
              </div>
            
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
                 <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
              </div>
            </div>

           
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
              title="Sair do sistema"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-lg group-hover:rotate-180 transition-transform duration-300" />
              <span className="hidden lg:inline">Sair</span>
            </button>
        
         
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="w-6 h-6" />
            </button>
          </div>
        </div>

      
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 animate-fadeIn">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center space-x-3 mx-2 ${
                    isActive(item.to)
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            {/* Mobile User Info */}
            <div className="mt-4 pt-4 border-t border-gray-100 px-4 flex items-center gap-3">
               <FontAwesomeIcon icon={faUserCircle} className="text-gray-400 text-3xl" />
               <div>
                  <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
               </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;