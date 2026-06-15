// Import the Zustand store hook to access transactions and delete function
import { useTransactionStore } from '../store/transactionStore';

// Component that displays all transactions in a table
const TransactionList = () => {
  // Destructure transactions array and delete function from the store
  const { transactions, deleteTransaction } = useTransactionStore();
  
  // Helper function: formats ISO date string to Hungarian locale (YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU'); // Example: "2026.06.05"
  };
  
  // Helper function: formats amount with +/- sign and Hungarian number format
  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount).toLocaleString('hu-HU'); // Adds thousand separators
    if (amount > 0) {
      return `+${absAmount} Ft`; // Positive amount (income) with plus sign
    } else if (amount < 0) {
      return `-${absAmount} Ft`; // Negative amount (expense) with minus sign
    }
    return `${absAmount} Ft`; // Zero amount (shouldn't normally happen)
  };
  
  // Sort transactions by date (newest first)
  // Create a copy of the array and sort it
  const sortedTransactions = [...transactions].sort((a, b) => {
    // Compare dates: newer dates come first (descending order)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Show empty state message when there are no transactions
  if (sortedTransactions.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Subtle shadow
        textAlign: 'center',
        color: '#9ca3af' // Gray color for empty state text
      }}>
        📭 Még nincs tranzakció. Adj hozzá az elsőt! {/* "No transactions yet. Add your first one!" */}
      </div>
    );
  }
  
  // Render the transaction table with all data
  return (
    <div className="table-container"> {/* CSS class for styling */}
      <h2 className="table-title">📋 Tranzakciók listája</h2> {/* "Transaction list" */}
      
      {/* Horizontal scroll wrapper for mobile responsiveness */}
      <div style={{ overflowX: 'auto' }}>
        <table className="transaction-table">
          {/* Table header */}
          <thead>
            <tr>
              <th>Dátum</th>      {/* "Date" */}
              <th>Tételnév</th>   {/* "Item name" */}
              <th>Kategória</th>  {/* "Category" */}
              <th style={{ textAlign: 'right' }}>Összeg</th>     {/* "Amount" - right aligned */}
              <th style={{ textAlign: 'center' }}>Művelet</th>   {/* "Action" - centered */}
            </tr>
          </thead>
          {/* Table body - iterates through transactions */}
          <tbody>
            {sortedTransactions.map((sortedTransactions) => (
              // Each row has a unique key (React requirement for list rendering)
              <tr key={sortedTransactions.id} className="transaction-row">
                {/* Date column */}
                <td>{formatDate(sortedTransactions.date)}</td>
                {/* Name column with bold font weight */}
                <td style={{ fontWeight: '500' }}>{sortedTransactions.name}</td>
                {/* Category column */}
                <td>{sortedTransactions.category}</td>
                {/* Amount column - right aligned, color based on positive/negative */}
                <td style={{ textAlign: 'right' }}>
                  <span className={sortedTransactions.amount > 0 ? 'positive' : 'negative'}>
                    {formatAmount(sortedTransactions.amount)}
                  </span>
                </td>
                {/* Action column - delete button */}
                <td style={{ textAlign: 'center' }}>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTransaction(sortedTransactions.id)} // Remove transaction when clicked
                  >
                    🗑️ Törlés {/* "Delete" with trash emoji */}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer showing total transaction count */}
      <div className="table-footer">
        Összesen: {sortedTransactions.length} tranzakció {/* "Total: X transactions" */}
      </div>
    </div>
  );
};

export default TransactionList;
