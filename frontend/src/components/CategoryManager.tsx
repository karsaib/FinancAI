// Import required hooks
import { useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';

// Category Manager Component
const CategoryManager = () => {
  const { categories, addCategory, deleteCategory } = useTransactionStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [isAdding, setIsAdding] = useState(false);
  
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
    
    setIsAdding(true);
    await addCategory({
      id: Date.now().toString(),
      name: newCategoryName,
      icon: newCategoryIcon
    });
    
    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setIsAdding(false);
  };
  
  const handleDeleteCategory = async (id: string, name: string) => {
    // Check if category is in use
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
  
  return (
    <div className="table-container">
      <h2 className="table-title">🏷️ Kategóriák kezelése</h2>
      
      <div style={{ padding: '1.5rem' }}>
        {/* Add new category form */}
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>
            ➕ Új kategória hozzáadása
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
                placeholder="Pl.: Kávézó, Mozgás, stb."
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
        
        {/* List of categories */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>
            📋 Meglévő kategóriák ({categories.length})
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
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
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#eff6ff',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#1e40af'
          }}>
            <strong>💡 Tipp:</strong> Csak a saját magad által hozzáadott kategóriákat törölheted. 
            Az alapértelmezett kategóriák (🛒 Élelmiszer, 💡 Rezsi, stb.) nem törölhetők.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
