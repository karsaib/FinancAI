// Import required hooks and types
import { useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import type { Category } from '../store/transactionStore';

// Category Manager Component
const CategoryManager = () => {
  const { categories, addCategory, deleteCategory, recategorizeTransactions } = useTransactionStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryKeywords, setNewCategoryKeywords] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRecategorizing, setIsRecategorizing] = useState(false);

  // Ideiglenes állapot a meglévő kategóriák kulcsszavainak szerkesztéséhez
  const [keywordInputs, setKeywordInputs] = useState<{ [key: string]: string }>({});
  
  // Common icons for categories
  const iconOptions = [
    '🛒', '💡', '🚗', '🎬', '🏥', '💰', '👕', '📦', '🍔', '☕', 
    '🎮', '📚', '✈️', '🏠', '🐶', '💄', '⚽', '🎵', '📱', '🎁'
  ];
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Kérlek add meg a kategória nevét!');
      return;
    }

    // Kulcsszavak feldolgozása vesszők mentén
    const keywordsArray = newCategoryKeywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);
    
    setIsAdding(true);
    await addCategory({
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      keywords: keywordsArray
    });
    
    setNewCategoryName('');
    setNewCategoryKeywords('');
    setNewCategoryIcon('📦');
    setIsAdding(false);
  };

  const handleAddKeyword = async (cat: Category) => {
    const inputVal = keywordInputs[cat.id] || '';
    if (!inputVal.trim()) return;

    const newKeywords = inputVal
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    const updatedKeywords = Array.from(new Set([...(cat.keywords || []), ...newKeywords]));

    await deleteCategory(cat.id);
    await addCategory({
      ...cat,
      keywords: updatedKeywords
    });

    setKeywordInputs({ ...keywordInputs, [cat.id]: '' });
  };

  const handleRemoveKeyword = async (cat: Category, keywordToRemove: string) => {
    const updatedKeywords = (cat.keywords || []).filter(kw => kw !== keywordToRemove);
    await deleteCategory(cat.id);
    await addCategory({
      ...cat,
      keywords: updatedKeywords
    });
  };
  
  const handleDeleteCategory = async (id: string, name: string) => {
    const { transactions } = useTransactionStore.getState();
    const isInUse = transactions.some(t => t.category === name);
    
    if (isInUse) {
      alert(`A(z) "${name}" kategória használatban van! Először módosítsd a tranzakciók kategóriáját.`);
      return;
    }
    
    const confirmed = window.confirm(`Biztosan törlöd a "${name}" kategóriát?`);
    if (confirmed) {
      await deleteCategory(id);
    }
  };

  const handleRecategorize = async () => {
    setIsRecategorizing(true);
    try {
      await recategorizeTransactions();
      alert('Az összes korábbi tranzakció sikeresen frissült az aktuális kategóriák és kulcsszavak alapján!');
    } catch (error) {
      console.error(error);
      alert('Hiba történt az újrakategorizálás során.');
    } finally {
      setIsRecategorizing(false);
    }
  };
  
  return (
    <div className="table-container">
      <h2 className="table-title">🏷️ Kategóriák és kulcsszavak kezelése</h2>
      
      <div style={{ padding: '1.5rem' }}>
        {/* Add new category form */}
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>
            ➕ Új kategória hozzáadása kulcsszavakkal
          </h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Kategória név
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Pl.: Étterem, Autó, stb."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ flex: 2, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Kulcsszavak (vesszővel elválasztva)
              </label>
              <input
                type="text"
                value={newCategoryKeywords}
                onChange={(e) => setNewCategoryKeywords(e.target.value)}
                placeholder="Pl.: kisherceg, grill, etterem"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Ikon
              </label>
              <select
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            
            <div>
              <button
                onClick={handleAddCategory}
                disabled={isAdding}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: isAdding ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {isAdding ? 'Hozzáadás...' : '➕ Hozzáadás'}
              </button>
            </div>
          </div>
        </div>

        {/* Meglévő tranzakciók újrakategorizálása gomb */}
        <div style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#ecfdf5', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          border: '1px solid #a7f3d0' 
        }}>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#065f46', margin: 0 }}>🔄 Tranzakciók frissítése</h4>
            <p style={{ fontSize: '0.75rem', color: '#047857', margin: '0.25rem 0 0 0' }}>Ha új kulcsszót adtál meg, ide kattintva az összes meglévő tranzakció újra lesz kategorizálva.</p>
          </div>
          <button
            onClick={handleRecategorize}
            disabled={isRecategorizing}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: isRecategorizing ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            {isRecategorizing ? 'Folyamatban...' : '⚡ Újrakategorizálás'}
          </button>
        </div>
        
        {/* List of categories */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>
            📋 Meglévő kategóriák és kulcsszavaik ({categories.length})
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {cat.name}
                    </span>
                  </div>
                  {!cat.id.startsWith('default') && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      🗑️ Kategória törlése
                    </button>
                  )}
                </div>

                {/* Kulcsszavak listája */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Kulcsszavak:</span>
                  {cat.keywords && cat.keywords.length > 0 ? (
                    cat.keywords.map(kw => (
                      <span
                        key={kw}
                        style={{
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {kw}
                        <button
                          onClick={() => handleRemoveKeyword(cat, kw)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#4338ca',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: 0,
                            lineHeight: 1
                          }}
                          title="Kulcsszó törlése"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#9ca3af' }}>Nincsenek egyedi kulcsszavak</span>
                  )}
                </div>

                {/* Új kulcsszó hozzáadása ehhez a kategóriához */}
                <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Új kulcsszó (pl. boltneve)..."
                    value={keywordInputs[cat.id] || ''}
                    onChange={(e) => setKeywordInputs({ ...keywordInputs, [cat.id]: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.25rem 0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  />
                  <button
                    onClick={() => handleAddKeyword(cat)}
                    style={{
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    + Kulcsszó
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            backgroundColor: '#eff6ff',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#1e40af'
          }}>
            <strong>💡 Tipp:</strong> Ha módosítod a kulcsszavakat, a fenti zöld <strong>⚡ Újrakategorizálás</strong> gombra kattintva azonnal frissítheted a már meglévő tranzakcióidat is!
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;