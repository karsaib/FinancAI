// Import required hooks and libraries
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

// Color palette for charts
const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

// Statistics component
const Statistics = () => {
  const { transactions } = useTransactionStore();
  
  // Calculate balance over time (cumulative sum) - FIXED SORTING
  const balanceOverTime = useMemo(() => {
    // Make a copy and sort by date (oldest first) - CRITICAL for line chart!
    const sorted = [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // Ascending: oldest first
    });
    
    let runningBalance = 0;
    const balanceData = [];
    
    sorted.forEach((transaction) => {
      runningBalance += transaction.amount;
      balanceData.push({
        date: new Date(transaction.date).toLocaleDateString('hu-HU'),
        fullDate: transaction.date,
        balance: runningBalance,
        name: transaction.name,
        amount: transaction.amount,
        formattedDate: new Date(transaction.date).toLocaleDateString('hu-HU', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        })
      });
    });
    
    return balanceData;
  }, [transactions]);
  
  // Calculate category totals for pie chart
  const categoryTotals = useMemo(() => {
    const expenses = transactions.filter(t => t.amount < 0);
    const categoryMap = new Map();
    
    expenses.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [transactions]);
  
  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const monthlyMap = new Map();
    
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('hu-HU', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { income: 0, expense: 0 });
      }
      
      const data = monthlyMap.get(month);
      if (t.amount > 0) {
        data.income += t.amount;
      } else {
        data.expense += Math.abs(t.amount);
      }
    });
    
    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      saving: data.income - data.expense
    }));
  }, [transactions]);
  
  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalBalance = totalIncome - totalExpense;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('hu-HU')} Ft`;
  };
  
  // Custom tooltip for balance chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.formattedDate || label}</p>
          <p style={{ margin: '5px 0', color: '#4f46e5', fontWeight: 'bold' }}>
            Egyenleg: {formatCurrency(data.balance)}
          </p>
          {data.name && (
            <>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                Utolsó tranzakció: {data.name}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: data.amount > 0 ? '#10b981' : '#ef4444' }}>
                Összeg: {data.amount > 0 ? '+' : '-'}{Math.abs(data.amount).toLocaleString('hu-HU')} Ft
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
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
  
  // Find min and max balance for better Y-axis scaling
  const minBalance = Math.min(...balanceOverTime.map(d => d.balance), 0);
  const maxBalance = Math.max(...balanceOverTime.map(d => d.balance), totalIncome);
  const yAxisDomain = [minBalance - (maxBalance - minBalance) * 0.1, maxBalance + (maxBalance - minBalance) * 0.1];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Balance Over Time - Line Chart */}
      <div className="table-container">
        <h2 className="table-title">📈 Egyenleg változása időben</h2>
        {balanceOverTime.length > 0 ? (
          <div style={{ padding: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Kezdő egyenleg: </span>
                <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>0 Ft</span>
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Jelenlegi egyenleg: </span>
                <span style={{ fontWeight: 'bold', color: totalBalance >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatCurrency(totalBalance)}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Változás: </span>
                <span style={{ fontWeight: 'bold', color: totalBalance >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={balanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={yAxisDomain}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Egyenleg (Ft)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', r: 6, strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                  name="Egyenleg"
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#166534'
            }}>
              💡 Tipp: A vonal minden tranzakció után változik. Ha nagyobb kiadást adsz hozzá, a vonal meredekebben csökken!
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            Nincs elég adat a diagramhoz
          </div>
        )}
      </div>
      
      {/* Monthly Summary - Area Chart */}
      <div className="table-container">
        <h2 className="table-title">📊 Havi bevétel vs kiadás</h2>
        <div style={{ padding: '1rem' }}>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                name="Bevétel"
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stackId="1"
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.3}
                name="Kiadás"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Two-column layout for pie chart and summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Category Breakdown - Pie Chart */}
        <div className="table-container">
          <h2 className="table-title">🥧 Kiadások kategóriánként</h2>
          <div style={{ padding: '1rem' }}>
            {categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                Nincs kiadási adat
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="table-container">
          <h2 className="table-title">📋 Összegzés</h2>
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Összes tranzakció</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                {transactions.length} db
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Összes kiadás</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                {formatCurrency(totalExpense)}
              </p>
            </div>
            {transactions.filter(t => t.amount > 0).length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Legmagasabb bevétel</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(Math.max(...transactions.map(t => t.amount).filter(a => a > 0), 0))}
                </p>
              </div>
            )}
            {transactions.filter(t => t.amount < 0).length > 0 && (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Legmagasabb kiadás</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {formatCurrency(Math.max(...transactions.map(t => Math.abs(t.amount)).filter(a => a > 0), 0))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
