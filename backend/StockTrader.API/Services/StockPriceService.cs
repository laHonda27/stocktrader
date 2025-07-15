using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StockTrader.API.Data;
using StockTrader.API.DTOs;
using StockTrader.API.Hubs;
using StockTrader.API.Models;

namespace StockTrader.API.Services
{
    public class StockPriceService : IStockPriceService, IDisposable
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IHubContext<StockPriceHub> _hubContext;
        private readonly ILogger<StockPriceService> _logger;
        private Timer? _timer;
        private readonly Random _random = new();
        private bool _isRunning = false;

        public StockPriceService(
            IServiceScopeFactory serviceScopeFactory,
            IHubContext<StockPriceHub> hubContext,
            ILogger<StockPriceService> logger)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _hubContext = hubContext;
            _logger = logger;
        }

        public Task StartSimulation()
        {
            if (_isRunning) return Task.CompletedTask;

            _isRunning = true;
            _timer = new Timer(UpdatePrices, null, TimeSpan.Zero, TimeSpan.FromSeconds(3));
            _logger.LogInformation("Simulation des prix démarrée");

            return Task.CompletedTask;
        }

        public Task StopSimulation()
        {
            _isRunning = false;
            _timer?.Dispose();
            _logger.LogInformation("Simulation des prix arrêtée");

            return Task.CompletedTask;
        }

        public async Task<IEnumerable<Stock>> GetCurrentPrices()
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            return await context.Stocks.ToListAsync();
        }

        private async void UpdatePrices(object? state)
        {
            if (!_isRunning) return;

            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var stocks = await context.Stocks.ToListAsync();
                var updatedStocks = new List<StockDto>();

                foreach (var stock in stocks)
                {
                    // Sauvegarder le prix précédent
                    stock.PreviousPrice = stock.CurrentPrice;

                    // Simuler un changement de prix (-5% à +5%)
                    var changePercent = (_random.NextDouble() - 0.5) * 0.1; // -5% à +5%
                    var newPrice = stock.CurrentPrice * (1 + (decimal)changePercent);

                    // Éviter les prix négatifs
                    stock.CurrentPrice = Math.Max(0.01m, Math.Round(newPrice, 2));
                    stock.LastUpdated = DateTime.UtcNow;

                    updatedStocks.Add(new StockDto
                    {
                        Id = stock.Id,
                        Symbol = stock.Symbol,
                        Name = stock.Name,
                        CurrentPrice = stock.CurrentPrice,
                        PreviousPrice = stock.PreviousPrice,
                        LastUpdated = stock.LastUpdated
                    });
                }

                await context.SaveChangesAsync();

                // Envoyer les nouvelles prix via SignalR
                await _hubContext.Clients.Group("StockPrices").SendAsync("PriceUpdate", updatedStocks);

                _logger.LogDebug($"Prix mis à jour pour {updatedStocks.Count} actions");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour des prix");
            }
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}