#!/bin/bash
echo "🚀 Démarrage de StockTrader..."

# Vérifier que Docker est démarré
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Construire et démarrer les containers
echo "📦 Construction des images Docker..."
docker-compose build

echo "🎯 Démarrage des services..."
docker-compose up -d

echo "⏳ Attente que les services soient prêts..."
sleep 30

# Vérifier que tout fonctionne
echo "🔍 Vérification des services..."

if curl -f http://localhost:5172/health >/dev/null 2>&1; then
    echo "✅ API: http://localhost:5172"
else
    echo "❌ API non accessible"
fi

if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "❌ Frontend non accessible"
fi

echo ""
echo "🎉 StockTrader est prêt !"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:5172"
echo "   Swagger: http://localhost:5172/swagger"