import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import {
  BanknotesIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { ethers } from "ethers";
import abi from "../../artifacts/contracts/NativeLoanWithPenalty.sol/NativeLoanWithPenalty.json";

const CreditRequest = () => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    crypto: '',
    term: '12', // meses por defecto
    purpose: '',
    monthlyIncome: '',
    employmentType: '',
    employmentTime: '',
    walletType: '',
    walletAddress: '',
    network: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // Agregar estas funciones de validación después de los imports
  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const validateWalletInfo = (walletType, walletAddress, network) => {
    const errors = {};
    
    if (!walletType) {
      errors.walletType = 'Debes seleccionar tu wallet';
    }
    
    if (!walletAddress) {
      errors.walletAddress = 'Debes ingresar la dirección de tu wallet';
    } else if (!isValidEthereumAddress(walletAddress)) {
      errors.walletAddress = 'La dirección de wallet no es válida';
    }
    
    if (!network) {
      errors.network = 'Debes seleccionar la red blockchain';
    }
    
    return errors;
  };

  // Modificar la función validateForm
  const validateForm = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.amount || formData.amount < 0.01) {
        newErrors.amount = 'El monto debe ser mayor a 0.01';
      }
      if (!formData.crypto) {
        newErrors.crypto = 'Debes seleccionar la criptomoneda';
      }
      if (!formData.term || formData.term < 3 || formData.term > 36) {
        newErrors.term = 'El plazo debe estar entre 3 y 36 meses';
      }
      if (!formData.purpose) {
        newErrors.purpose = 'Debes especificar el propósito del crédito';
      }
    }

    if (step === 2) {
      if (!formData.monthlyIncome || formData.monthlyIncome < 0) {
        newErrors.monthlyIncome = 'El ingreso mensual debe ser mayor a 0';
      }
      if (!formData.employmentType) {
        newErrors.employmentType = 'Debes seleccionar tu tipo de empleo';
      }
      if (!formData.employmentTime) {
        newErrors.employmentTime = 'Debes especificar tu tiempo de empleo';
      }
    }

    if (step === 3) {
      const walletErrors = validateWalletInfo(
        formData.walletType,
        formData.walletAddress,
        formData.network
      );
      Object.assign(newErrors, walletErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (formData.network === "moonbase" && formData.crypto === "DEV") {
        if (!window.ethereum) throw new Error("MetaMask no está instalado");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const { chainId } = await provider.getNetwork();
        const moonbaseChainIds = [1287, "1287", "0x507", 1287n];
        if (!moonbaseChainIds.includes(chainId)) throw new Error("Por favor, selecciona la red Moonbase Alpha en MetaMask");

        // Parámetros del contrato
        const interestAmount = ethers.parseEther("0.1"); // Puedes ajustar según tu lógica
        const durationSeconds = 7 * 24 * 60 * 60; // 7 días, puedes ajustar según tu lógica
        const loanAmount = ethers.parseEther(formData.amount);

        // Despliegue del contrato
        const factory = new ethers.ContractFactory(
          abi.abi,
          abi.bytecode,
          signer
        );
        const contract = await factory.deploy(interestAmount, durationSeconds, {
          value: loanAmount,
        });

        await contract.waitForDeployment();

        const contractAddress = await contract.getAddress();
        alert("Contrato desplegado en: " + contractAddress);

        // Guardar la dirección del contrato en localStorage (simple para empezar)
        const userLoanContracts = JSON.parse(localStorage.getItem(`loans_${user.walletAddress}`) || '[]');
        userLoanContracts.push(contractAddress);
        localStorage.setItem(`loans_${user.walletAddress}`, JSON.stringify(userLoanContracts));

        // Aquí puedes guardar la dirección para seguimiento, o avanzar al dashboard
        window.location.href = '/dashboard';
        setFormData({
          amount: '',
          crypto: '',
          term: '12',
          purpose: '',
          monthlyIncome: '',
          employmentType: '',
          employmentTime: '',
          walletType: '',
          walletAddress: '',
          network: ''
        });
        setStep(1);
        return;
      }
      // Simulación de contrato inteligente
      const mockContract = {
        async requestLoan(params) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return {
            success: true,
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            loanId: 'LOAN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            timestamp: new Date().toISOString()
          };
        }
      };

      await mockContract.requestLoan({
        walletAddress: formData.walletAddress,
        amount: formData.amount,
        network: formData.network,
        term: formData.term,
        walletType: formData.walletType
      });

      alert('¡Solicitud enviada con éxito!');
      window.location.href = '/dashboard'; // Cambia la ruta según tu menú principal

      setFormData({
        amount: '',
        crypto: '',
        term: '12',
        purpose: '',
        monthlyIncome: '',
        employmentType: '',
        employmentTime: '',
        walletType: '',
        walletAddress: '',
        network: ''
      });
      setStep(1);
    } catch (error) {
      setErrors({ 
        submit: error?.reason || error?.message || JSON.stringify(error) || 'Error al procesar la solicitud. Por favor, verifica tu conexión y vuelve a intentar.' 
      });
      console.error("ERROR REAL:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculo de cuota mensual estimada
  const calculateMonthlyPayment = () => {
    const amount = parseFloat(formData.amount) || 0;
    const term = parseInt(formData.term) || 12;
    const annualRate = 0.24; // 24% anual
    const monthlyRate = annualRate / 12;
    
    if (amount === 0 || term === 0) return 0;
    
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                          (Math.pow(1 + monthlyRate, term) - 1);
    
    return monthlyPayment.toFixed(4);
  };

  const steps = [
    {
      id: 1,
      name: 'Detalles del Crédito',
      icon: BanknotesIcon,
      description: 'Define el monto y propósito de tu crédito'
    },
    {
      id: 2,
      name: 'Información Laboral',
      icon: BriefcaseIcon,
      description: 'Proporciona tus datos de empleo'
    },
    {
      id: 3,
      name: 'Información Bancaria',
      icon: BuildingOfficeIcon,
      description: 'Ingresa tus datos bancarios'
    }
  ];

  const renderStepIndicator = () => (
    <div className="py-6 px-8 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => (
          <div key={stepItem.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === stepItem.id
                ? 'bg-primary-600 text-white'
                : step > stepItem.id
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step > stepItem.id ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <stepItem.icon className="w-6 h-6" />
              )}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                step === stepItem.id
                  ? 'text-primary-600'
                  : step > stepItem.id
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}>
                {stepItem.name}
              </p>
              <p className="text-xs text-gray-500">{stepItem.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block w-full mx-4">
                <div className={`h-0.5 ${
                  step > stepItem.id ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Monto del Préstamo
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`block w-full pl-3 pr-3 py-3 border ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200`}
                    placeholder="0.1"
                    min="0.01"
                    step="any"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formData.crypto ? `Criptomoneda seleccionada: ${formData.crypto}` : 'Selecciona la criptomoneda'}
                </div>
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.amount}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="crypto" className="block text-sm font-medium text-gray-700">
                  Criptomoneda
                </label>
                <select
                  id="crypto"
                  name="crypto"
                  value={formData.crypto}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border ${
                    errors.crypto ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200`}
                >
                  <option value="">Selecciona la criptomoneda</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="DAI">DAI</option>
                  <option value="USDC">USDC</option>
                  <option value="DEV">DEV</option>
                </select>
                {errors.crypto && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.crypto}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="term" className="block text-sm font-medium text-gray-700">
                  Plazo (meses)
                </label>
                <select
                  id="term"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border ${
                    errors.term ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200`}
                >
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="18">18 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                </select>
                {errors.term && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.term}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Propósito del Crédito
              </label>
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border ${
                  errors.purpose ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200`}
              >
                <option value="">Selecciona un propósito</option>
                <option value="negocio">Inversión en Negocio</option>
                <option value="personal">Gastos Personales</option>
                <option value="educacion">Educación</option>
                <option value="salud">Salud</option>
                <option value="vivienda">Mejoras en Vivienda</option>
                <option value="otro">Otro</option>
              </select>
              {errors.purpose && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  {errors.purpose}
                </p>
              )}
            </div>

            {formData.amount && formData.term && formData.crypto && (
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
                <h3 className="text-lg font-medium text-primary-900">Resumen de Pago Estimado</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Cuota Mensual</p>
                    <p className="mt-1 text-2xl font-semibold text-primary-600">
                      {calculateMonthlyPayment()} {formData.crypto}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Interés Total</p>
                    <p className="mt-1 text-2xl font-semibold text-primary-600">
                      {(parseFloat(calculateMonthlyPayment()) * parseInt(formData.term) - parseFloat(formData.amount)).toFixed(4)} {formData.crypto}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Total a Pagar</p>
                    <p className="mt-1 text-2xl font-semibold text-primary-600">
                      {(parseFloat(calculateMonthlyPayment()) * parseInt(formData.term)).toFixed(4)} {formData.crypto}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-primary-700">
                  * Esta es una estimación basada en una tasa de interés anual del 24%
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700">
                  Ingreso Mensual Aproximado (en cripto)
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    name="monthlyIncome"
                    id="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    className={`block w-full pl-3 pr-12 py-3 border ${
                      errors.monthlyIncome ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200`}
                    placeholder="0.5"
                    min="0"
                    step="any"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{formData.crypto || 'CRYPTO'}</span>
                  </div>
                </div>
                {errors.monthlyIncome && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.monthlyIncome}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
                  Tipo de Empleo
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border ${
                    errors.employmentType ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200`}
                >
                  <option value="">Selecciona tu tipo de empleo</option>
                  <option value="formal">Empleado Formal</option>
                  <option value="informal">Empleado Informal</option>
                  <option value="independiente">Trabajador Independiente</option>
                  <option value="empresario">Empresario</option>
                </select>
                {errors.employmentType && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors.employmentType}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="employmentTime" className="block text-sm font-medium text-gray-700">
                Tiempo en el Empleo Actual
              </label>
              <select
                id="employmentTime"
                name="employmentTime"
                value={formData.employmentTime}
                onChange={handleChange}
                className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border ${
                  errors.employmentTime ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200`}
              >
                <option value="">Selecciona el tiempo</option>
                <option value="menos_6">Menos de 6 meses</option>
                <option value="6_12">6 a 12 meses</option>
                <option value="1_2">1 a 2 años</option>
                <option value="2_5">2 a 5 años</option>
                <option value="mas_5">Más de 5 años</option>
              </select>
              {errors.employmentTime && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  {errors.employmentTime}
                </p>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Documentación Requerida</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Comprobante de ingresos (últimos 3 meses)</li>
                      <li>Identificación oficial vigente</li>
                      <li>Comprobante de domicilio</li>
                      <li>RFC</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Wallet
                </label>
                <select
                  name="walletType"
                  value={formData.walletType}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.walletType ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500`}
                >
                  <option value="">Selecciona tu wallet</option>
                  <option value="metamask">MetaMask</option>
                  <option value="walletconnect">WalletConnect</option>
                  <option value="coinbase">Coinbase Wallet</option>
                </select>
                {errors.walletType && (
                  <p className="mt-2 text-sm text-red-600">{errors.walletType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección de Wallet
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.walletAddress ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500`}
                  placeholder="0x..."
                />
                {errors.walletAddress && (
                  <p className="mt-2 text-sm text-red-600">{errors.walletAddress}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Red Blockchain
              </label>
              <select
                name="network"
                value={formData.network}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md ${
                  errors.network ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-primary-500 focus:ring-primary-500`}
              >
                <option value="">Selecciona la red</option>
                <option value="ethereum">Ethereum Mainnet</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
                <option value="moonbase">Moonbase Alpha</option>
              </select>
              {errors.network && (
                <p className="mt-2 text-sm text-red-600">{errors.network}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Información Importante</h3>
              <p className="mt-2 text-sm text-gray-500">La wallet proporcionada será utilizada para:</p>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                <li>El desembolso del préstamo en cripto (ETH, USDT, DAI, etc.)</li>
                <li>Los pagos automáticos mensuales en cripto</li>
                <li>La devolución de garantías en cripto (si aplica)</li>
              </ul>
              <p className="mt-2 text-sm text-gray-500">Asegúrate de que la wallet esté conectada y tenga suficiente ETH para gas fees.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setShowSuccessModal(false)}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                ¡Solicitud Enviada con Éxito!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Tu solicitud de crédito ha sido recibida y está siendo procesada. Te notificaremos cuando sea revisada.
                </p>
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-900">ID del Préstamo:</span>
                      </div>
                      <span className="text-sm font-mono text-primary-600">{requestId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Hash de Transacción:</span>
                      <span className="text-sm font-mono text-primary-600">
                        {contractResult?.txHash?.substring(0, 10)}...{contractResult?.txHash?.substring(58)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Red:</span>
                      <span className="text-sm text-primary-600">{formData.network}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    <strong>Próximos pasos:</strong>
                  </p>
                  <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                    <li>Revisión de tu solicitud (24-48 horas)</li>
                    <li>Verificación de documentos</li>
                    <li>Notificación de aprobación</li>
                    <li>Desembolso del crédito</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                setShowSuccessModal(false);
                // Aquí podrías redirigir al dashboard o a la página de seguimiento
              }}
            >
              Ver Seguimiento
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setShowSuccessModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {renderStepIndicator()}
        
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
          {errors.submit && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {renderFormStep()}

          <div className="px-8 py-6 bg-gray-50 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 text-gray-400" />
                Anterior
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ml-auto"
              >
                Siguiente
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Solicitud
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {showSuccessModal && <SuccessModal />}
    </>
  );
};

export default CreditRequest; 