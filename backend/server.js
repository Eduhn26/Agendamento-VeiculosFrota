const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// 🔐 Segurança básica com Helmet
app.use(helmet());

// 🌐 CORS seguro
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL // domínio real em produção
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado:', origin);
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization']
}));

app.options('*', cors());

// 📦 JSON parser
app.use(express.json());

// 🧭 Logger simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 🚀 Conexão segura ao MongoDB
console.log('🔗 Conectando ao MongoDB...');

if (!process.env.MONGODB_URI) {
  console.error("❌ ERRO FATAL: MONGODB_URI não definido no arquivo .env");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log('📊 Banco:', mongoose.connection.db?.databaseName);
  })
  .catch((error) => {
    console.error('❌ Erro na conexão MongoDB:', error.message);
    process.exit(1);
  });

// 🛣 Rotas
try {
  const authRoutes = require('./routes/authRoutes');
  const vehicleRoutes = require('./routes/vehicleRoutes');
  const rentalRoutes = require('./routes/rentalRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/rentals', rentalRoutes);

} catch (e) {
  console.log('⚠️ Erro ao carregar rotas:', e.message);
}

// ✔ Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';

    res.json({
      status: 'OK',
      message: 'Backend funcionando!',
      database: {
        status: dbStatus,
        name: mongoose.connection.db?.databaseName || 'N/A',
        readyState: mongoose.connection.readyState
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro no health check',
      error: error.message
    });
  }
});

// ✔ Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// ❌ Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// ❌ Handler global de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// 🚀 Inicialização do servidor somente após conexão MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 API Test: http://localhost:${PORT}/api/test`);
  });
});

// 🛑 Fechamento seguro em SIGINT
mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão MongoDB:', err);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await mongoose.connection.close();
  console.log('🟢 Conexão MongoDB encerrada.');
  process.exit(0);
});
