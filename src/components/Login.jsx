import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../App'
import {
  WalletIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const Login = () => {
  const { login } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    walletAddress: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [chainId, setChainId] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [nombreWallet, setNombreWallet] = useState('')

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '/wallets/metamask.svg',
      description: 'La wallet más popular para Ethereum y redes compatibles',
      color: '#E17736'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '/wallets/walletconnect.svg',
      description: 'Conecta con múltiples wallets a través de QR',
      color: '#3B99FC'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '/wallets/coinbase.svg',
      description: 'Wallet oficial de Coinbase',
      color: '#0052FF'
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '/wallets/trustwallet.svg',
      description: 'Wallet móvil segura y fácil de usar',
      color: '#3375BB'
    }
  ]

  // Verificar si MetaMask está instalado
  const checkMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined'
  }

  // Escuchar cambios en la cuenta de MetaMask
  useEffect(() => {
    if (checkMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (checkMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setFormData(prev => ({ ...prev, walletAddress: '' }))
      setIsWalletConnected(false)
    } else {
      setFormData(prev => ({ ...prev, walletAddress: accounts[0] }))
      setIsWalletConnected(true)
      setNombreWallet(wallets.find(w => w.id === 'metamask')?.name || '')
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(chainId)
    window.location.reload()
  }

  const addMoonbaseAlpha = async () => {
    if (!window.ethereum) {
      alert("MetaMask no está instalado");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x507",
          chainName: "Moonbase Alpha",
          nativeCurrency: {
            name: "DEV",
            symbol: "DEV",
            decimals: 18
          },
          rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
          blockExplorerUrls: ["https://moonbase.moonscan.io"]
        }]
      });
    } catch (err) {
      alert("No se pudo agregar la red: " + err.message);
    }
  };

  const handleWalletSelect = async (walletId) => {
    setIsConnectingWallet(true)
    setSelectedWallet(walletId)
    setErrors({})
    
    try {
      if (walletId === 'metamask') {
        if (!checkMetaMaskInstalled()) {
          window.open('https://metamask.io/download/', '_blank')
          throw new Error('MetaMask no está instalado. Por favor, instálalo y vuelve a intentar.')
        }

        // Solicitar conexión a MetaMask y esperar la respuesta del usuario
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts'
        })

        if (!accounts || accounts.length === 0) {
          throw new Error('No se pudo obtener la cuenta de MetaMask. Por favor, intenta de nuevo.')
        }

        const currentChainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        })
        setChainId(currentChainId)

        // Verificar si estamos en la red Moonbase Alpha
        if (currentChainId !== '0x507') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x507' }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              // Si la red no está agregada, la agregamos
              await addMoonbaseAlpha();
            } else {
              throw new Error('Por favor, cambia a la red Moonbase Alpha en MetaMask');
            }
          }
        }

        // Verificar que la cuenta sea válida
        if (!accounts[0] || !/^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
          throw new Error('La dirección de la wallet no es válida')
        }

        // Actualizar el estado con la cuenta conectada
        setFormData(prev => ({
          ...prev,
          walletAddress: accounts[0]
        }))
        setIsWalletConnected(true)
        setShowWalletModal(false)
        setNombreWallet('MetaMask')
        localStorage.setItem('walletName', 'MetaMask')

      } else {
        throw new Error('Por ahora solo soportamos MetaMask')
      }
    } catch (error) {
      console.error('Error al conectar wallet:', error)
      setErrors({
        wallet: error.message || 'Error al conectar la wallet. Por favor, intenta de nuevo.'
      })
      setFormData(prev => ({ ...prev, walletAddress: '' }))
      setIsWalletConnected(false)
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const handleLogin = async () => {
    setErrors({})
    if (!isWalletConnected || !formData.walletAddress) {
      setErrors({
        wallet: 'Por favor, conecta tu wallet primero'
      })
      return
    }
    setIsLoading(true)
    try {
      console.log('Wallet que se va a loguear:', formData.walletAddress)
      await login(formData.walletAddress)
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setErrors({
        wallet: 'Error al iniciar sesión. Por favor, verifica que esta wallet esté registrada.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const WalletModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Selecciona tu Wallet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Para continuar, necesitamos que conectes tu wallet de MetaMask. 
              Se abrirá una ventana de MetaMask donde deberás autorizar la conexión.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletSelect(wallet.id)}
                  disabled={isConnectingWallet}
                  className={`relative flex items-center p-4 border rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ${
                    isConnectingWallet ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{
                    borderColor: wallet.color,
                    '--tw-bg-opacity': '0.05',
                    backgroundColor: `rgba(${wallet.color}, var(--tw-bg-opacity))`
                  }}
                >
                  <div className="flex items-center">
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="h-8 w-8"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0id2hpdGUiPjxwYXRoIGQ9Ik0xNSA3aDNhMiAyIDAgMCAxIDIgMnY5YTIgMiAwIDAgMS0yIDJINmEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg3Ii8+PHBhdGggZD0iTTEwIDE0bDQtNG0wIDBsLTQgNE0xNCAxMGg0djQiLz48L3N2Zz4='
                      }}
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{wallet.name}</p>
                      <p className="text-xs text-gray-500">{wallet.description}</p>
                    </div>
                  </div>
                  {isConnectingWallet && selectedWallet === wallet.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Seguridad Garantizada',
      description: 'Tus datos están protegidos con la más alta tecnología de encriptación'
    },
    {
      icon: CreditCardIcon,
      title: 'Créditos Rápidos',
      description: 'Obtén tu crédito en menos de 24 horas con tasas competitivas'
    },
    {
      icon: BanknotesIcon,
      title: 'Sin Comisiones Ocultas',
      description: 'Transparencia total en todos nuestros procesos y tarifas'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="flex min-h-screen">
        {/* Panel Izquierdo - Formulario de Login */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                WorkChainMX
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Tu plataforma de microcréditos descentralizados
              </p>
            </div>

            <div className="mt-8">
              <div className="mt-6">
                <div className="space-y-6">
                  {errors.wallet && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{errors.wallet}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="wallet" className="block text-sm font-medium text-gray-700">
                      Conecta tu Wallet
                    </label>
                    <div className="mt-1">
                      {isWalletConnected ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <WalletIcon className="h-5 w-5 text-green-500" />
                            <span className="ml-2 font-bold text-primary-700">
                              {nombreWallet || 'Wallet'}
                            </span>
                            <span className="ml-2 text-sm font-mono text-gray-600">
                              {formData.walletAddress
                                ? `${formData.walletAddress.slice(0, 6)}...${formData.walletAddress.slice(-4)}`
                                : ''}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              {chainId === '0x507' ? 'Moonbase Alpha' : 'Red no soportada'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, walletAddress: '' }))
                                setIsWalletConnected(false)
                              }}
                              className="text-sm text-red-600 hover:text-red-500"
                            >
                              Desconectar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowWalletModal(true)}
                          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                        >
                          <WalletIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Conectar Wallet
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Botón para agregar Moonbase Alpha manualmente */}
               
                  <div>
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={isLoading || !isWalletConnected}
                      className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                          Iniciando sesión...
                        </>
                      ) : !isWalletConnected ? (
                        'Conecta tu wallet para continuar'
                      ) : (
                        <>
                          Iniciar Sesión
                          <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Características */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800">
            <div className="absolute inset-0 bg-opacity-75 bg-[url('/pattern.svg')] bg-center" />
            <div className="absolute inset-0 flex flex-col justify-center px-12 py-12">
              <div className="max-w-lg">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Bienvenido a WorkChainMX
                </h2>
                <p className="mt-4 text-lg text-primary-100">
                  Tu plataforma de microcréditos descentralizados que te permite acceder a financiamiento de manera rápida, segura y transparente.
                </p>
                <div className="mt-12 space-y-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-primary-200" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                        <p className="mt-1 text-sm text-primary-100">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWalletModal && <WalletModal />}
    </div>
  )
}

export default Login 