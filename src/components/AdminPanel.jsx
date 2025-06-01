import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:3001/api';
const ADMIN_TOKEN = 'admin-secret-token'; // En producción, usar un sistema más seguro

export default function AdminPanel() {
  const navigate = useNavigate();
  const [cryptoValues, setCryptoValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCrypto, setEditingCrypto] = useState(null);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchCryptoValues();
  }, []);

  const fetchCryptoValues = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/crypto-values`, {
        headers: {
          'admin-token': ADMIN_TOKEN
        }
      });
      
      if (!response.ok) {
        throw new Error('No autorizado');
      }

      const data = await response.json();
      setCryptoValues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (crypto) => {
    setEditingCrypto(crypto);
    setNewValue(cryptoValues[crypto].value.toString());
  };

  const handleSave = async (crypto) => {
    try {
      const response = await fetch(`${API_URL}/admin/crypto-values/${crypto}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({ value: parseFloat(newValue) })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el valor');
      }

      const updatedValue = await response.json();
      setCryptoValues(prev => ({
        ...prev,
        [crypto]: updatedValue
      }));
      setEditingCrypto(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingCrypto(null);
    setNewValue('');
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
        <button
          onClick={() => navigate('/dashboard')}
          className="block mx-auto mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-gray-400" />
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-gray-400" />
          Volver al Dashboard
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Valores de Criptomonedas</h2>
          <div className="space-y-4">
            {Object.entries(cryptoValues).map(([crypto, data]) => (
              <div key={crypto} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{crypto}</h3>
                  <p className="text-sm text-gray-500">
                    Última actualización: {new Date(data.lastUpdated).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {editingCrypto === crypto ? (
                    <>
                      <input
                        type="number"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        step="0.000001"
                        min="0"
                      />
                      <button
                        onClick={() => handleSave(crypto)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-semibold text-gray-900">
                        {data.value.toFixed(6)} USD
                      </span>
                      <button
                        onClick={() => handleEdit(crypto)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 