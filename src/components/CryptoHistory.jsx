import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useLoanHistory } from '../utils/loanHistory';

const statusColors = {
  'Funded': 'bg-blue-100 text-blue-800',
  'Taken': 'bg-yellow-100 text-yellow-800',
  'Repaid': 'bg-green-100 text-green-800',
  'Defaulted': 'bg-red-100 text-red-800',
};

export default function CryptoHistory() {
  const { user } = useContext(AuthContext);
  const { loans, loading, error } = useLoanHistory();
  const [expandedLoan, setExpandedLoan] = useState(null);

  const toggleExpand = (contractAddress) => {
    setExpandedLoan(expandedLoan === contractAddress ? null : contractAddress);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-2">Historial de Préstamos Cripto</h2>
      <p className="mb-6 text-gray-600">Resumen de préstamos relacionados con tu wallet</p>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando historial...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error al cargar el historial: {error.message}</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No tienes historial de préstamos registrados.
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => (
            <div key={loan.contractAddress} className="border rounded-lg overflow-hidden">
              <button
                className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition"
                onClick={() => toggleExpand(loan.contractAddress)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Préstamo: {loan.contractAddress.slice(0, 6)}...{loan.contractAddress.slice(-4)}</h3>
                  <p className="text-sm text-gray-600">Estado: <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColors[loan.state]}`}>{loan.state === 'Error' ? 'Validado' : loan.state}</span></p>
                </div>
                {expandedLoan === loan.contractAddress ? <ChevronUpIcon className="h-5 w-5 text-gray-600" /> : <ChevronDownIcon className="h-5 w-5 text-gray-600" />}
              </button>
              {expandedLoan === loan.contractAddress && (
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
                     <div><strong>Préstamo en:</strong> {loan.loanAmount} DEV</div>
                     <div><strong>Pagar en:</strong> {loan.totalDue} DEV</div>
                  </div>
                  <h4 className="text-md font-semibold mb-2 text-gray-800">Eventos:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {loan.events.map((event, eventIdx) => (
                      <li key={eventIdx} className="border-b border-gray-100 pb-1 last:border-b-0">
                        <strong>{event.type}:</strong> 
                        {Object.entries(event.args).map(([key, value]) => (
                           typeof value !== 'object' && typeof value !== 'bigint' && key !== '__typename' && (
                              <span key={key} className="ml-2 text-xs font-mono text-gray-500">{key}: {String(value)}</span>
                           )
                        ))}
                         <span className="ml-2 text-xs text-gray-400">({new Date(Number(event.timestamp) * 1000).toLocaleString()})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 