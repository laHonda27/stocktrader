FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/out .

# Copier la config Docker spécifique
COPY appsettings.Docker.json ./appsettings.Production.json

EXPOSE 8080

ENTRYPOINT ["dotnet", "StockTrader.API.dll"]