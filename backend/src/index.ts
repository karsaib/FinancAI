import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ideiglenes memória tároló
let transactions: any[] = [];

// Egészségügyi ellenőrzés - _req jelzi, hogy nem használjuk
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FinancIA API is running',
    timestamp: new Date().toISOString()
  });
});

// Összes tranzakció lekérése
app.get('/api/transactions', (_req, res) => {
  res.json(transactions);
});

// Új tranzakció hozzáadása
app.post('/api/transactions', (req, res) => {
  const { amount, type, categoryId, date, note, paymentMethod } = req.body;
  
  const newTransaction = {
    id: crypto.randomUUID(),
    amount,
    type,
    categoryId,
    date,
    note: note || '',
    paymentMethod,
    createdAt: new Date().toISOString()
  };
  
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Tranzakció törlése
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  transactions = transactions.filter(t => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🤖 FinancIA backend fut: http://localhost:${PORT}`);
});
