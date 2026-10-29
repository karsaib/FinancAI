import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import Papa from 'papaparse';
import { autoCategorize } from '../utils/categorizer';

export default function BankUpload() {
  const { importTransactions, categories, loadCategories } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    Papa.parse(file, {
      header: false,
      delimiter: ';',
      encoding: 'UTF-8',
      complete: async (results) => {
        try {
          const rows = results.data as string[][];
          const dataRows = rows.slice(4); // 5. sortól jönnek az adatok
          
          const newTransactions = dataRows
            .filter(row => row.length > 2 && row[2])
            .map((row, index) => {
              const rawAmount = row[2] || '0';
              const cleanAmount = parseFloat(
                rawAmount.replace(/\s/g, '').replace(',', '.')
              );

              const rawDate = row[9] || '';
              const formattedDate = rawDate.replace(/\./g, '-').replace(/-$/, '');
              const description = row[8] || row[17] || row[1] || 'Banki tranzakció';
              
              // Itt adjuk át a description-t és a store-ból jövő categories tömböt
              const detectedCategory = autoCategorize(description, categories);

              return {
                id: `${Date.now()}_${index}`,
                name: description.trim(),
                amount: isNaN(cleanAmount) ? 0 : cleanAmount,
                category: detectedCategory,
                date: formattedDate || new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
              };
            });

          await importTransactions(newTransactions);
          setMessage(`Sikeresen beimportálva ${newTransactions.length} tranzakció! 🎉`);
        } catch (error) {
          console.error('Import hiba:', error);
          setMessage('Hiba történt a feldolgozás során.');
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        console.error('PapaParse hiba:', error);
        setLoading(false);
        setMessage('Nem sikerült beolvasni a fájlt.');
      }
    });
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>🏦 Bankszámlakivonat importálása</h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Töltsd fel a banki CSV exportodat, és a rendszer automatikusan kategorizálja a tételeket.
      </p>

      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        disabled={loading}
      />

      {loading && <p style={{ color: '#4f46e5', marginTop: '1rem' }}>Feldolgozás alatt...</p>}
      {message && <p style={{ color: '#10b981', marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}