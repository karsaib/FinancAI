import { useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';

const AddTransactionForm = () => {
  const { addTransaction, categories } = useTransactionStore();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: categories[0]?.name || 'Egyéb',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) {
      alert('Kérlek töltsd ki a tételnevet és az összeget!');
      return;
    }
    
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum)) {
      alert('Kérlek érvényes összeget adj meg!');
      return;
    }
    
    const newTransaction = {
      id: Date.now().toString(),
      name: formData.name,
      amount: amountNum,
      category: formData.category,
      date: formData.date,
      createdAt: new Date().toISOString()
    };
    
    await addTransaction(newTransaction);
    
    setFormData({
      name: '',
      amount: '',
      category: categories[0]?.name || 'Egyéb',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="form-container">
      <h2 className="form-title">➕ Új tranzakció</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label className="form-label">Tételnév *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Pl.: Tesco bevásárlás"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Összeg * (pozitív = bevétel, negatív = kiadás)</label>
            <input
              type="number"
              className="form-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Pl.: -12500 vagy 350000"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Kategória</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Dátum</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>
        
        <button type="submit" className="submit-btn">
          ✅ Hozzáadás
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;
