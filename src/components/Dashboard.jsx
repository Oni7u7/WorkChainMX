import { useContext, useState, useRef } from 'react'
import { AuthContext } from '../App'
import CreditRequest from './CreditRequest'
import CryptoHistory from './CryptoHistory'
import SolicitudPrestamo from './SolicitudPrestamo'
import {
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext)
  const [showCreditRequest, setShowCreditRequest] = useState(false)
  const historyRef = useRef(null);
  const navigate = useNavigate();

  // Función para verificar si el usuario es administrador
  const isAdmin = (walletAddress) => {
    const adminWallets = [
      '0x123...', // Reemplaza con tu dirección de wallet
    ];
    return adminWallets.includes(walletAddress);
  };

  const stats = [
    {
      name: 'Puntuación de Crédito Cripto',
      value: user?.creditScore || 0,
      icon: ChartBarIcon,
      change: '+12%',
      changeType: 'increase',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Préstamos Cripto Activos',
      value: user?.activeCredits || 0,
      icon: CreditCardIcon,
      change: '2 préstamos',
      changeType: 'neutral',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Total Prestado en Cripto',
      value: user?.totalCredits
        ? `${user.totalCredits} ${user?.mainCrypto || 'ETH'}`
        : `0 ETH`,
      icon: BanknotesIcon,
      change: '+1.2 ETH',
      changeType: 'increase',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  const quickActions = [
    {
      name: 'Solicitar Préstamo Cripto',
      description: 'Solicita un nuevo préstamo en ETH, USDT, DAI, etc.',
      icon: ArrowTrendingUpIcon,
      action: () => setShowCreditRequest(true),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      name: 'Ver Historial Cripto',
      description: 'Consulta tu historial de préstamos y pagos en cripto',
      icon: ClockIcon,
      action: () => {
        if (historyRef.current) {
          historyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Perfil',
      description: 'Consulta tus estadisticas propias',
      icon: UserCircleIcon,
      action: () => navigate('/perfil-graficas'),
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      name: 'Documentos',
      description: 'Gestiona tus documentos y verificaciones',
      icon: DocumentTextIcon,
      action: () => navigate('/documentos'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  // Agregar acción de administración si el usuario es admin
  if (isAdmin(user?.walletAddress)) {
    quickActions.push({
      name: 'Panel de Administración',
      description: 'Gestiona los valores de las criptomonedas',
      icon: Cog6ToothIcon,
      action: () => navigate('/admin'),
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    });
  }

  if (showCreditRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navbar mejorada */}
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    WorkChainMX
                  </h1>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-500">|</span>
                  <span className="text-sm font-medium text-gray-600">Solicitud de Crédito</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreditRequest(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Volver al Dashboard
                </button>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Formulario de Solicitud de Crédito */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <CreditRequest />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar mejorada */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  WorkChainMX
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm font-medium text-gray-600">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  Bienvenido, <span className="font-medium text-gray-900">
                    {localStorage.getItem('walletName') || 'Wallet'}
                  </span>
                  <span className="ml-2 font-mono text-gray-500">
                    {user?.walletAddress
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : ''}
                  </span>
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className={`${stat.bgColor} rounded-2xl shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-105`}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 
                      stat.changeType === 'neutral' ? 'text-blue-600' : 'text-red-600'
                    }`}>{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Botón de Solicitud de Préstamo */}
        <div className="mb-8 flex justify-center">
          <SolicitudPrestamo />
        </div>

        {/* Sección de Acciones Rápidas */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className={`${action.bgColor} rounded-xl p-6 text-left transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-medium ${action.color}`}>{action.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                    </div>
                    <div className={`p-3 rounded-full ${action.bgColor}`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sección de Actividad Reciente */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Actividad Cripto Reciente</h2>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Ver todo
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividad cripto reciente</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cuando realices préstamos o pagos en cripto, aparecerán aquí.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div ref={historyRef}>
        <CryptoHistory />
      </div>
    </div>
  )
}

export default Dashboard 