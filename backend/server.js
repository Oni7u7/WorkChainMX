const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Datos de ejemplo (en producción usar una base de datos)
let cryptoValues = {
  ETH: { value: 2000, lastUpdated: new Date() },
  USDT: { value: 1, lastUpdated: new Date() },
  DAI: { value: 1, lastUpdated: new Date() },
  USDC: { value: 1, lastUpdated: new Date() },
  DEV: { value: 0.1, lastUpdated: new Date() }
};

// Middleware de autenticación de administrador
const isAdmin = (req, res, next) => {
  const adminToken = req.headers['admin-token'];
  // En producción, usar un sistema de autenticación más seguro
  if (adminToken === 'admin-secret-token') {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
};

// Rutas públicas
app.get('/api/crypto-values', (req, res) => {
  res.json(cryptoValues);
});

// Rutas de administrador
app.get('/api/admin/crypto-values', isAdmin, (req, res) => {
  res.json(cryptoValues);
});

app.put('/api/admin/crypto-values/:crypto', isAdmin, (req, res) => {
  const { crypto } = req.params;
  const { value } = req.body;

  if (!cryptoValues[crypto]) {
    return res.status(404).json({ error: 'Criptomoneda no encontrada' });
  }

  if (typeof value !== 'number' || value <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  cryptoValues[crypto] = {
    value,
    lastUpdated: new Date()
  };

  res.json(cryptoValues[crypto]);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 