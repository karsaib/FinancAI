// Import React hook for lifecycle management
import { useState, useEffect } from 'react';
// Import custom form component for adding new transactions
import AddTransactionForm from './components/AddTransactionForm';
// Import component that displays the list of transactions
import TransactionList from './components/TransactionList';
// Import statistics component
import Statistics from './components/Statistics';
// Import export/import component
import ExportImport from './components/ExportImport';
// Import category manager component
import CategoryManager from './components/CategoryManager';
// Import Zustand store hook for state management
import { useTransactionStore } from './store/transactionStore';

function App() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'transactions' | 'statistics' | 'categories' | 'backup'>('transactions');
  
  // Transactions array, load function, and loading state from the store
  const { transactions, loadTransactions, loading } = useTransactionStore();
  
  // useEffect runs once when component mounts - load transactions from IndexedDB
  useEffect(() => {
    loadTransactions(); // Fetch all saved transactions from local database
  }, []); // Empty dependency array = run only on mount
  
  // Calculate total balance (income - expenses)
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  // Calculate total income (only positive amounts)
  const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  // Calculate total expenses (only negative amounts, convert to positive for display)
  const expense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Show loading spinner while fetching data from database
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Betöltés...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header section with app title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🤖 FinancIA
          </h1>
          <p style={{ color: '#6b7280' }}>
            Intelligens pénzügyi asszisztensed
          </p>
        </div>
        
        {/* Summary cards row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="summary-card">
            <p>Összes bevétel</p>
            <p className="amount" style={{ color: '#10b981' }}>
              +{income.toLocaleString('hu-HU')} Ft
            </p>
          </div>
          
          <div className="summary-card">
            <p>Összes kiadás</p>
            <p className="amount" style={{ color: '#ef4444' }}>
              -{expense.toLocaleString('hu-HU')} Ft
            </p>
          </div>
          
          <div className="summary-card">
            <p>Egyenleg</p>
            <p className="amount" style={{ color: total >= 0 ? '#4f46e5' : '#ef4444' }}>
              {total.toLocaleString('hu-HU')} Ft
            </p>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('transactions')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'transactions' ? 'bold' : 'normal',
              color: activeTab === 'transactions' ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === 'transactions' ? '2px solid #4f46e5' : 'none',
              transition: 'all 0.2s'
            }}
          >
            📝 Tranzakciók
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'statistics' ? 'bold' : 'normal',
              color: activeTab === 'statistics' ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === 'statistics' ? '2px solid #4f46e5' : 'none',
              transition: 'all 0.2s'
            }}
          >
            📊 Statisztika
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'categories' ? 'bold' : 'normal',
              color: activeTab === 'categories' ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === 'categories' ? '2px solid #4f46e5' : 'none',
              transition: 'all 0.2s'
            }}
          >
            🏷️ Kategóriák
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'backup' ? 'bold' : 'normal',
              color: activeTab === 'backup' ? '#4f46e5' : '#6b7280',
              borderBottom: activeTab === 'backup' ? '2px solid #4f46e5' : 'none',
              transition: 'all 0.2s'
            }}
          >
            💾 Biztonsági mentés
          </button>
        </div>
        
        {/* Tab content */}
        {activeTab === 'transactions' && (
          <>
            <AddTransactionForm />
            <TransactionList />
          </>
        )}
        {activeTab === 'statistics' && <Statistics />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'backup' && <ExportImport />}
      </div>
    </div>
  );
}

export default App;
