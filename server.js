import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from './src/generated/index.js';

const prisma = new PrismaClient();
// ... sisa kode server kamu ...
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// API ENDPOINTS
// ==========================================

// Test Koneksi
app.get('/', (req, res) => {
  res.json({ message: "DevDash Backend API Running Perfectly!" });
});

// 1. Users
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Projects
app.get('/api/projects/:userId', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ 
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Finance (Atomic Transactions)
app.get('/api/finance/accounts/:userId', async (req, res) => {
  try {
    const accounts = await prisma.financeAccount.findMany({ where: { userId: req.params.userId } });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/finance/transactions', async (req, res) => {
  try {
    const { amount, type, description, categoryId, accountId, userId } = req.body;
    
    // Transaksi atomik Prisma untuk mengupdate balance akun terkait
    const result = await prisma.$transaction(async (tx) => {
      const trx = await tx.transaction.create({
        data: { amount, type, description, categoryId, accountId, userId }
      });
      
      const account = await tx.financeAccount.findUnique({ where: { id: accountId } });
      const newBalance = type === 'INCOME' 
        ? account.balance + amount 
        : account.balance - amount;
        
      await tx.financeAccount.update({
        where: { id: accountId },
        data: { balance: newBalance }
      });
      
      return trx;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handling ES Module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error handling middleware for API routes - pindahkan ke bawah API Endpoint
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// 5. Menyajikan File Frontend (Mode Produksi)
// Kode ini menyuruh server.js untuk memberikan file hasil build dari Vite
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Tangkap semua route selain /api agar tidak error 404 saat direfresh di React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`Server & Frontend berjalan pada http://localhost:${port}`);
});