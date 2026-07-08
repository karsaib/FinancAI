import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTransactionStore } from '../store/transactionStore';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

function Statistics() {
  const { transactions } = useTransactionStore();
  
  console.log('Statistics rendering - transactions:', transactions.length);
  
  // Balance over time
  const balanceOverTime = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const sorted = [...transactions].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    let runningBalance = 0;
    return sorted.map((t) => {
      runningBalance += t.amount;
      const dateObj = new Date(t.date);
      return {
        formattedDate: dateObj.toLocaleDateString('hu-HU', { year: 'numeric', month: 'numeric', day: 'numeric' }),
        balance: runningBalance,
        name: t.name,
        amount: t.amount
      };
    });
  }, [transactions]);
  
  // Monthly category data
  const monthlyCategoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const monthlyMap = new Map();
    
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { displayMonth, categories: new Map() });
      }
      
      const entry = monthlyMap.get(monthKey);
      const current = entry.categories.get(t.category) || 0;
      entry.categories.set(t.category, current + Math.abs(t.amount));
    });
    
    const result = [];
    for (const [monthKey, { displayMonth, categories }] of monthlyMap) {
      const data = [];
      for (const [category, amount] of categories) {
        data.push({ name: category, value: amount });
      }
      result.push({ monthKey, displayMonth, data });
    }
    
    result.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    return result;
  }, [transactions]);
  
  // Monthly summary
  const monthlySummary = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const monthlyMap = new Map();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { displayMonth, income: 0, expense: 0 });
      }
      
      const data = monthlyMap.get(monthKey);
      if (t.amount > 0) {
        data.income += t.amount;
      } else {
        data.expense += Math.abs(t.amount);
      }
    });
    
    const result = Array.from(monthlyMap.entries()).map(([monthKey, data]) => ({
      month: data.displayMonth,
      monthKey,
      income: data.income,
      expense: data.expense,
      saving: data.income - data.expense
    }));
    
    result.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    return result;
  }, [transactions]);
  
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalBalance = totalIncome - totalExpense;
  
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('hu-HU')} Ft`;
  };
  
  if (transactions.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        📊 Nincs elég adat a statisztikákhoz. Adj hozzá több tranzakciót!
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Line Chart */}
      <div className="table-container">
        <h2 className="table-title">📈 Egyenleg változása időben</h2>
        {balanceOverTime.length > 0 && (
          <div style={{ padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={balanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={3} name="Egyenleg" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Area Chart */}
      <div className="table-container">
        <h2 className="table-title">📊 Havi bevétel vs kiadás</h2>
        {monthlySummary.length > 0 && (
          <div style={{ padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Bevétel" />
                <Area type="monotone" dataKey="expense" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Kiadás" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Pie Charts */}
      <div className="table-container">
        <h2 className="table-title">🥧 Havi kiadások kategóriánként</h2>
        <div style={{ padding: '1rem' }}>
          {monthlyCategoryData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {monthlyCategoryData.map(({ monthKey, displayMonth, data }) => (
                <div key={monthKey} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem', textAlign: 'center' }}>
                    📅 {displayMonth}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span>Összes kiadás: <strong style={{ color: '#ef4444' }}>{formatCurrency(data.reduce((sum, d) => sum + d.value, 0))}</strong></span>
                    <span>Kategóriák száma: <strong>{data.length}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Nincs kiadási adat</div>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <div className="table-container">
        <h2 className="table-title">📋 Összegzés</h2>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Összes tranzakció</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>{transactions.length} db</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Összes kiadás</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(totalExpense)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Összes bevétel</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(totalIncome)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Egyenleg</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalBalance >= 0 ? '#4f46e5' : '#ef4444' }}>{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
