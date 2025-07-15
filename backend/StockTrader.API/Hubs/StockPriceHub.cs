﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace StockTrader.API.Hubs
{
    [Authorize]
    public class StockPriceHub : Hub
    {
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public override async Task OnConnectedAsync()
        {
            // Ajouter l'utilisateur au groupe "StockPrices"
            await Groups.AddToGroupAsync(Context.ConnectionId, "StockPrices");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "StockPrices");
            await base.OnDisconnectedAsync(exception);
        }
    }
}