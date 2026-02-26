import './config/env.js';

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import logRoutes from './routes/logs.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';

const app = express();

// const corsOptions = {
//   origin: [
//     'http://localhost:3000',
//     'http://127.0.0.1:3000',
//     process.env.FRONTEND_URL || 'http://localhost:3000'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://tce-project-final.vercel.app'
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);
app.use('/logs', logRoutes);
app.use('/invoices', invoiceRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
});
