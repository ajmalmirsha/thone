import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import investigationRoutes from './routes/investigations.js';
import todoRoutes from './routes/todos.js';
import medicineRoutes from './routes/medicines.js';
import instructionRoutes from './routes/instructions.js';
import bystanderBriefRoutes from './routes/bystanderBriefs.js';
import scanRoutes from './routes/scans.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Investigation routes: nested under patients for listing, flat for update/delete
app.use('/api/patients', investigationRoutes);
app.use('/api/investigations', investigationRoutes);

// TODO routes: nested under patients for listing, flat for update/delete
app.use('/api/patients', todoRoutes);
app.use('/api/todos', todoRoutes);

// Medicine routes: nested under patients for listing, flat for update/delete/administer
app.use('/api/patients', medicineRoutes);
app.use('/api/medicines', medicineRoutes);

// Instruction routes: nested under patients
app.use('/api/patients', instructionRoutes);

// Bystander brief routes: nested under patients for listing, flat for update/delete
app.use('/api/patients', bystanderBriefRoutes);
app.use('/api/bystander-briefs', bystanderBriefRoutes);

// Scan routes: nested under patients for listing/analyzing, flat for view/apply/delete
app.use('/api/patients', scanRoutes);
app.use('/api/scans', scanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🏥 Thone Hospital API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
