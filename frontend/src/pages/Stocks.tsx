import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioService } from '../services/api';
import { useRealtimeStocks } from '../hooks/useRealtimeStocks'; // Ajouter
import PriceDisplay from '../components/PriceDisplay'; // Ajouter
import { TrendingUp, TrendingDown, ShoppingCart, Minus, Plus, Activity, Search } from 'lucide-react';

const Stocks: React.FC = () => {
  const { user } = useAuth();
  
  // Remplacer les anciens states par le hook
  const { stocks, loading, error, priceChanges } = useRealtimeStocks();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [isTransacting, setIsTransacting] = useState(false);

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransaction = async () => {
    if (!selectedStock || quantity <= 0) return;

    setIsTransacting(true);
    try {
      if (transactionType === 'buy') {
        await portfolioService.buyStock(selectedStock.id, quantity);
      } else {
        await portfolioService.sellStock(selectedStock.id, quantity);
      }
      
      setSelectedStock(null);
      setQuantity(1);
      alert(`Transaction réussie ! ${quantity} actions de ${selectedStock.symbol} ${transactionType === 'buy' ? 'achetées' : 'vendues'}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la transaction');
    } finally {
      setIsTransacting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actions</h1>
          <p className="text-gray-600 mt-1">Achetez et vendez des actions</p>
        </div>
        <div className="live-indicator">
          <span className="text-sm text-green-600 font-medium">● En temps réel</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
            placeholder="Rechercher une action..."
          />
        </div>
      </div>

      {/* Stocks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map((stock) => (
          <div key={stock.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
                <p className="text-sm text-gray-600">{stock.name}</p>
              </div>
              <div className="text-right">
                <PriceDisplay
                  currentPrice={stock.currentPrice}
                  previousPrice={stock.previousPrice}
                  animation={priceChanges[stock.id]}
                  className="text-xl"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedStock(stock);
                  setTransactionType('buy');
                }}
                className="btn-success flex-1 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Acheter
              </button>
              <button
                onClick={() => {
                  setSelectedStock(stock);
                  setTransactionType('sell');
                }}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                <Minus className="w-4 h-4" />
                Vendre
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Modal - Rest of the code stays the same */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {transactionType === 'buy' ? 'Acheter' : 'Vendre'} {selectedStock.symbol}
            </h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Prix actuel</span>
                <span className="font-semibold">{selectedStock.currentPrice.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Quantité</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span>{(selectedStock.currentPrice * quantity).toFixed(2)}€</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Solde disponible</span>
                <span>{user?.balance.toLocaleString('fr-FR')}€</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedStock(null)}
                className="btn-secondary flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleTransaction}
                disabled={isTransacting}
                className={`${transactionType === 'buy' ? 'btn-success' : 'btn-danger'} flex-1 flex items-center justify-center gap-2`}
              >
                {isTransacting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {isTransacting ? 'Traitement...' : (transactionType === 'buy' ? 'Acheter' : 'Vendre')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;