using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StockTrader.API.Data;
using StockTrader.API.Services;
using StockTrader.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };

        // Pour SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddSingleton<StockPriceService>();

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:3000", "http://frontend:3000")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

var app = builder.Build();

// 🆕 Créer la base de données automatiquement
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Attendre que SQL Server soit prêt
        var retryCount = 0;
        var maxRetries = 30; // 30 * 2 = 60 secondes max

        while (retryCount < maxRetries)
        {
            try
            {
                await context.Database.CanConnectAsync();
                break;
            }
            catch
            {
                retryCount++;
                Console.WriteLine($"Tentative de connexion à la base de données ({retryCount}/{maxRetries})...");
                await Task.Delay(2000); // Attendre 2 secondes
            }
        }

        if (retryCount >= maxRetries)
        {
            throw new Exception("Impossible de se connecter à la base de données après plusieurs tentatives");
        }

        Console.WriteLine("✅ Connexion à la base de données réussie");

        // Créer/migrer la base de données
        await context.Database.MigrateAsync();
        Console.WriteLine("✅ Base de données créée/mise à jour");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Erreur lors de l'initialisation de la base de données : {ex.Message}");
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<StockPriceHub>("/hubs/stockprice");

// Démarrer le service de simulation des prix
var stockPriceService = app.Services.GetRequiredService<StockPriceService>();
_ = Task.Run(() => stockPriceService.StartSimulation());

app.Run();