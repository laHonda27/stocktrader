import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioService } from '../services/api';
import { Portfolio } from '../types';
import { Wallet, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

const PortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      setError('Erreur lors du chargement du portefeuille');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return portfolio.reduce((total, item) => {
      return total + (item.stock.currentPrice * item.quantity);
    }, 0);
  };

  const calculateTotalChange = () => {
    return portfolio.reduce((total, item) => {
      const change = (item.stock.currentPrice - item.averagePrice) * item.quantity;
      return total + change;
    }, 0);
  };

  const calculateTotalInvested = () => {
    return portfolio.reduce((total, item) => {
      return total + (item.averagePrice * item.quantity);
    }, 0);
  };

  const getItemChange = (item: Portfolio) => {
    return (item.stock.currentPrice - item.averagePrice) * item.quantity;
  };

  const getItemChangePercentage = (item: Portfolio) => {
    return ((item.stock.currentPrice - item.averagePrice) / item.averagePrice) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalValue = calculateTotalValue();
  const totalChange = calculateTotalChange();
  const totalInvested = calculateTotalInvested();
  const totalChangePercentage = totalInvested > 0 ? (totalChange / totalInvested) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Portefeuille</h1>
        <p className="text-gray-600 mt-1">Gérez vos investissements</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur totale</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalValue.toLocaleString('fr-FR')}€
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Investissement</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalInvested.toLocaleString('fr-FR')}€
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plus/moins-value</p>
              <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange.toLocaleString('fr-FR')}€
              </p>
            </div>
            <div className={`p-3 rounded-full ${totalChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totalChange >= 0 ? 
                <TrendingUp className="w-6 h-6 text-green-600" /> : 
                <TrendingDown className="w-6 h-6 text-red-600" />
              }
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Performance</p>
              <p className={`text-2xl font-bold ${totalChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChangePercentage >= 0 ? '+' : ''}{totalChangePercentage.toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${totalChangePercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Holdings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Mes positions</h2>
        </div>

        {portfolio.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Quantité</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Prix moyen</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Prix actuel</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Valeur</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">+/- Value</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => {
                  const change = getItemChange(item);
                  const changePercentage = getItemChangePercentage(item);
                  const currentValue = item.stock.currentPrice * item.quantity;
                  
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.stock.symbol}</p>
                          <p className="text-sm text-gray-600">{item.stock.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">{item.quantity}</td>
                      <td className="py-4 px-4 text-right">{item.averagePrice.toFixed(2)}€</td>
                      <td className="py-4 px-4 text-right font-medium">{item.stock.currentPrice.toFixed(2)}€</td>
                      <td className="py-4 px-4 text-right font-semibold">{currentValue.toFixed(2)}€</td>
                      <td className={`py-4 px-4 text-right font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}€
                      </td>
                      <td className={`py-4 px-4 text-right font-semibold ${changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune position</h3>
            <p className="text-gray-600 mb-4">Vous n'avez pas encore d'actions dans votre portefeuille</p>
            <button
              onClick={() => window.location.href = '/stocks'}
              className="btn-primary"
            >
              Commencer à investir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;