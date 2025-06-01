import { useNavigate } from 'react-router-dom';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useLoanHistory } from '../utils/loanHistory';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const statusColors = {
  'Funded': 'bg-blue-100 text-blue-800',
  'Taken': 'bg-yellow-100 text-yellow-800',
  'Repaid': 'bg-green-100 text-green-800',
  'Defaulted': 'bg-red-100 text-red-800',
  'Error': 'bg-purple-100 text-purple-800',
};

export default function PerfilGraficas() {
  console.log('Renderizando PerfilGraficas');
  const navigate = useNavigate();
  const { loans, loading, error } = useLoanHistory();
  
  console.log('Estado del hook:', { loans, loading, error });

  // Preparar datos para las gráficas
  const estados = loans.reduce((acc, loan) => {
    const state = loan.state === 'Error' ? 'Validado' : loan.state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});

  console.log('Estados calculados:', estados);

  const montos = loans.map(loan => ({
    address: loan.contractAddress.slice(0, 6) + '...' + loan.contractAddress.slice(-4),
    monto: parseFloat(loan.loanAmount || 0),
    totalDue: parseFloat(loan.totalDue || 0)
  }));

  console.log('Montos calculados:', montos);

  const dataEstados = {
    labels: Object.keys(estados),
    datasets: [
      {
        label: 'Cantidad de Préstamos',
        data: Object.values(estados),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',  // Funded
          'rgba(255, 206, 86, 0.6)',  // Taken
          'rgba(75, 192, 192, 0.6)',  // Repaid
          'rgba(255, 99, 132, 0.6)',  // Defaulted
          'rgba(153, 102, 255, 0.6)', // Validado
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const dataMontos = {
    labels: montos.map(m => m.address),
    datasets: [
      {
        label: 'Monto del Préstamo (DEV)',
        data: montos.map(m => m.monto),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Total a Pagar (DEV)',
        data: montos.map(m => m.totalDue),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const optionsMontos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Montos de Préstamos',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + ' DEV';
          }
        }
      },
    },
  };

  const optionsPie = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribución por Estado',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Análisis de Préstamos</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-gray-400" />
          Volver al Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando datos...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error al cargar los datos: {error.message}</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No hay datos de préstamos para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Distribución por Estado</h2>
            <div className="h-80">
              <Pie data={dataEstados} options={optionsPie} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Montos de Préstamos</h2>
            <div className="h-80">
              <Bar data={dataMontos} options={optionsMontos} />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Total Préstamos</h3>
                <p className="text-2xl font-semibold text-blue-900">{loans.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Total Prestado</h3>
                <p className="text-2xl font-semibold text-green-900">
                  {loans.reduce((sum, loan) => sum + parseFloat(loan.loanAmount || 0), 0).toFixed(2)} DEV
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">Total a Pagar</h3>
                <p className="text-2xl font-semibold text-purple-900">
                  {loans.reduce((sum, loan) => sum + parseFloat(loan.totalDue || 0), 0).toFixed(2)} DEV
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 