import { create } from 'zustand';
import Dexie from 'dexie';

// Adatbázis definíció
class FinanciaDB extends Dexie {
  transactions: Dexie.Table<Transaction, string>;
  categories: Dexie.Table<Category, string>;
  
  constructor() {
    super('FinanciaDB');
    this.version(3).stores({
      transactions: 'id, name, amount, category, date, createdAt',
      categories: 'id, name, icon, keywords'
    });
  }
}

// Típusok definiálása
interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  keywords?: string[];  
}

interface TransactionStore {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  addTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  importTransactions: (transactions: Transaction[]) => Promise<void>;
  deleteAllTransactions: () => Promise<void>;
  recategorizeTransactions: () => Promise<void>;
}

const db = new FinanciaDB();

// Default categories
const defaultCategories: Category[] = [
  { id: 'default1', name: 'Élelmiszer', icon: '🛒'},
  { id: 'default2', name: 'Rezsi', icon: '💡'},
  { id: 'default3', name: 'Közlekedés', icon: '🚗'},
  { id: 'default4', name: 'Szórakozás', icon: '🎬' },
  { id: 'default5', name: 'Egészség', icon: '🏥' },
  { id: 'default6', name: 'Fizetés', icon: '💰' },
  { id: 'default7', name: 'Ruha', icon: '👕' },
  { id: 'default8', name: 'Egyéb', icon: '📦' },
  { id: 'default9', name: 'Étkezés', icon: '🍽️' },
];

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  categories: [],
  loading: false,

  recategorizeTransactions: async () => {
    set({ loading: true });
    try {
      const currentTransactions = await db.transactions.toArray();
      const currentCategories = await db.categories.toArray();

      // Segédfüggvény az ékezetmentesítéshez
      const removeAccents = (str: string) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      // Frissítjük a tranzakciók kategóriáját a kulcsszavak alapján
      const updatedTransactions = currentTransactions.map(tx => {
        const cleanDesc = removeAccents(tx.name);
        let assignedCategory = 'Egyéb';

        for (const cat of currentCategories) {
          // 1. Ellenőrizzük magát a kategórianevet
          if (cleanDesc.includes(removeAccents(cat.name))) {
            assignedCategory = cat.name;
            break;
          }
          // 2. Ellenőrizzük a kulcsszavakat
          if (cat.keywords && Array.isArray(cat.keywords)) {
            const matchedKeyword = cat.keywords.some(
              kw => kw && cleanDesc.includes(removeAccents(kw))
            );
            if (matchedKeyword) {
              assignedCategory = cat.name;
              break;
            }
          }
        }

        return { ...tx, category: assignedCategory };
      });

      // Mentés az adatbázisba (bulkPut felülírja a létező azonosítójú elemeket)
      await db.transactions.bulkPut(updatedTransactions);
      set({ transactions: updatedTransactions, loading: false });
    } catch (error) {
      console.error('Hiba az újrakategorizáláskor:', error);
      set({ loading: false });
    }
  },
  
  loadTransactions: async () => {
    set({ loading: true });
    const transactions = await db.transactions.toArray();
    set({ transactions, loading: false });
  },

  deleteAllTransactions: async () => {
    set({ loading: true });
    try {
      await db.transactions.clear();
      set({ transactions: [], loading: false });
    } catch (error) {
      console.error('Hiba az összes tranzakció törlésekor:', error);
      set({ loading: false });
      throw error;
    }
  },
  
  loadCategories: async () => {
    const categories = await db.categories.toArray();
    if (categories.length === 0) {
      await db.categories.bulkAdd(defaultCategories);
      set({ categories: defaultCategories });
    } else {
      set({ categories });
    }
  },
  
  addTransaction: async (transaction) => {
    await db.transactions.add(transaction);
    const transactions = await db.transactions.toArray();
    set({ transactions });
  },
  
  deleteTransaction: async (id) => {
    await db.transactions.delete(id);
    const transactions = await db.transactions.toArray();
    set({ transactions });
  },
  
  addCategory: async (category) => {
    await db.categories.add(category);
    const categories = await db.categories.toArray();
    set({ categories });
  },
  
  deleteCategory: async (id) => {
    await db.categories.delete(id);
    const categories = await db.categories.toArray();
    set({ categories });
  },
  
  importTransactions: async (newTransactions) => {
    set({ loading: true });
    try {
      await db.transactions.bulkAdd(newTransactions);
      const transactions = await db.transactions.toArray();
      set({ transactions });
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));

// Initialize database with sample data if empty
const initSampleData = async () => {
  const txCount = await db.transactions.count();
  if (txCount === 0) {
    const sampleTransactions: Transaction[] = [
      {
        id: Date.now().toString() + '1',
        name: 'Tesco bevásárlás',
        amount: -12500,
        category: 'Élelmiszer',
        date: '2026-06-03',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now().toString() + '2',
        name: 'Fizetés',
        amount: 350000,
        category: 'Fizetés',
        date: '2026-06-01',
        createdAt: new Date().toISOString()
      }
    ];
    await db.transactions.bulkAdd(sampleTransactions);
  }
};

// Load categories and sample data
const loadInitialData = async () => {
  await initSampleData();
  const store = useTransactionStore.getState();
  await store.loadCategories();
};

loadInitialData();