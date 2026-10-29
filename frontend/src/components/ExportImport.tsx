// Import required hooks and libraries
import { useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';

// Export/Import component
const ExportImport = () => {
  const { transactions, importTransactions, deleteAllTransactions } = useTransactionStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      'BIZTOSAN törölni szeretnéd az ÖSSZES tranzakciót? Ez a művelet nem vonható vissza!'
    );
    
    if (!confirmed) return;

    try {
      await deleteAllTransactions();
      setDeleteMessage('Minden tranzakció sikeresen törölve! 🗑️');
      setTimeout(() => setDeleteMessage(''), 4000);
    } catch (error) {
      setDeleteMessage('Hiba történt a törlés során.');
    }
  };

  // Export transactions to JSON file
  const handleExport = () => {
    try {
      setIsExporting(true);
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        transactionCount: transactions.length,
        transactions: transactions.map(t => ({
          id: t.id,
          name: t.name,
          amount: t.amount,
          category: t.category,
          date: t.date,
          createdAt: t.createdAt
        }))
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financia_export_${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setImportMessage({ type: 'success', text: `✅ Sikeres export! ${transactions.length} tranzakció mentve.` });
      setTimeout(() => setImportMessage(null), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setImportMessage({ type: 'error', text: '❌ Hiba történt az exportálás során!' });
      setTimeout(() => setImportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Import transactions from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportMessage(null);
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        let transactionsToImport = [];
        
        if (importedData.transactions && Array.isArray(importedData.transactions)) {
          transactionsToImport = importedData.transactions;
        } else if (Array.isArray(importedData)) {
          transactionsToImport = importedData;
        } else {
          throw new Error('Invalid file format');
        }
        
        const validTransactions = transactionsToImport.filter(t => 
          t.id && 
          t.name && 
          typeof t.amount === 'number' && 
          t.category && 
          t.date
        );
        
        if (validTransactions.length === 0) {
          throw new Error('No valid transactions found in file');
        }
        
        const confirmed = window.confirm(
          `Biztosan importálod ${validTransactions.length} tranzakciót?\n\n` +
          `FIGYELEM: Ez hozzáfűzi a meglévő tranzakcióidhoz, nem felülírja!\n` +
          `(Duplikációk előfordulhatnak)`
        );
        
        if (!confirmed) {
          setIsImporting(false);
          event.target.value = '';
          return;
        }
        
        await importTransactions(validTransactions);
        
        setImportMessage({ 
          type: 'success', 
          text: `✅ Sikeres import! ${validTransactions.length} tranzakció hozzáadva.` 
        });
        setTimeout(() => setImportMessage(null), 3000);
        
      } catch (error) {
        console.error('Import error:', error);
        setImportMessage({ 
          type: 'error', 
          text: '❌ Hiba történt az importálás során! Ellenőrizd a fájl formátumát.' 
        });
        setTimeout(() => setImportMessage(null), 5000);
      } finally {
        setIsImporting(false);
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      setImportMessage({ type: 'error', text: '❌ Hiba a fájl olvasásakor!' });
      setIsImporting(false);
      setTimeout(() => setImportMessage(null), 3000);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="table-container">
      <h2 className="table-title">💾 Adatok mentése és visszatöltése</h2>
      
      <div style={{ padding: '1.5rem' }}>
        {/* Message display */}
        {importMessage && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            backgroundColor: importMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: importMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${importMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {importMessage.text}
          </div>
        )}
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Export section */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
              Adatok exportálása
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              {transactions.length} tranzakció mentése JSON fájlba
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting || transactions.length === 0}
              style={{
                backgroundColor: isExporting || transactions.length === 0 ? '#9ca3af' : '#4f46e5',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: isExporting || transactions.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              {isExporting ? '📀 Exportálás...' : '💾 Exportálás'}
            </button>
            {transactions.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Nincs mit exportálni
              </p>
            )}
          </div>
          
          {/* Import section */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📥</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
              Adatok importálása
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              JSON fájl betöltése (hozzáfűzés)
            </p>
            <label
              style={{
                display: 'inline-block',
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              {isImporting ? '⏳ Importálás...' : '📂 Fájl kiválasztása'}
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                disabled={isImporting}
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Csak .json fájl (FinancIA export)
            </p>
          </div>
        </div>
        
        {/* Info box */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#1e40af'
        }}>
          <strong>💡 Tipp:</strong> Az exportált fájlt bármikor visszatöltheted. 
          Az importálás hozzáfűzi az adatokat a meglévőkhöz, nem törli azokat!
          Készíts rendszeres biztonsági mentést a pénzügyi adataidról.
        </div>

        {/* VESZÉLYES ZÓNA - MINDEN TRANZAKCIÓ TÖRLÉSE */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          border: '1px solid #fee2e2',
          backgroundColor: '#fef2f2',
          borderRadius: '0.5rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#991b1b', fontSize: '1rem', fontWeight: 'bold' }}>
            ⚠️ Veszélyes zóna
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#b91c1c', marginBottom: '1rem' }}>
            Az összes rögzített tranzakció végleges törlése az adatbázisból.
          </p>

          <button
            onClick={handleDeleteAll}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            🗑️ Minden tranzakció törlése
          </button>

          {deleteMessage && (
            <p style={{ marginTop: '0.75rem', fontWeight: 'bold', color: '#047857', fontSize: '0.875rem' }}>
              {deleteMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImport;