import { useContext, useState } from 'react'
import { AuthContext } from '../App'
import { MenuIcon, XIcon } from '@heroicons/react/24/outline'

function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      // TODO: Implementar limpieza de datos de blockchain
      // Ejemplo: await disconnectWallet()
      await new Promise(resolve => setTimeout(resolve, 500))
      logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav 
      className="bg-white shadow-sm sticky top-0 z-50"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600">
              WorkChainMX
            </h1>
          </div>
          
          {/* Menú móvil */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">
                {isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              </span>
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Menú desktop */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="sr-only">Usuario:</span>
                <span aria-label={`Hola, ${user?.name}`}>
                  Hola, {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm text-gray-600 hover:text-gray-900 
                         focus:outline-none focus:underline transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={isLoggingOut}
              >
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil expandido */}
      <div 
        className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
        id="mobile-menu"
        role="menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <div className="block px-3 py-2 text-base font-medium text-gray-700">
            <span className="sr-only">Usuario:</span>
            <span aria-label={`Hola, ${user?.name}`}>
              Hola, {user?.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50
                     focus:outline-none focus:bg-gray-50 focus:text-gray-900
                     disabled:opacity-50 disabled:cursor-not-allowed"
            role="menuitem"
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 