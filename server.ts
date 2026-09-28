import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import clientRoutes from './server/routes/clientRoutes.js';
import equipementRoutes from './server/routes/equipementRoutes.js';
import demandeRoutes from './server/routes/demandeRoutes.js';
import serviceRoutes from './server/routes/serviceRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';
import searchRoutes from './server/routes/searchRoutes.js';
import { errorHandler } from './server/middleware/errorHandler.js';
import { initializeDataSeed } from './server/utils/dataInit.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize data seed if JSON files are empty
  await initializeDataSeed();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/utilisateurs', userRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/equipements', equipementRoutes);
  app.use('/api/demandes', demandeRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/search', searchRoutes);

  // Global API error handler
  app.use(errorHandler);

  // Vite development middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Reducte App] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
