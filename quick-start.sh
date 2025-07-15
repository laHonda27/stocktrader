#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "  ____  _             _    _____              _           "
echo " / ___|| |_ ___   ___| | _|_   _|_ __ __ _  __| | ___ _ __ "
echo " \___ \| __/ _ \ / __| |/ / | || '__/ _\` |/ _\` |/ _ \ '__|"
echo "  ___) | || (_) | (__|   <  | || | | (_| | (_| |  __/ |   "
echo " |____/ \__\___/ \___|_|\_\ |_||_|  \__,_|\__,_|\___|_|   "
echo ""
echo -e "${NC}${YELLOW}🎯 Plateforme de Trading Simulée - Demo Portfolio${NC}"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé. Veuillez installer Docker Desktop.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas démarré. Veuillez lancer Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker détecté et fonctionnel${NC}"

# Télécharger le docker-compose
echo -e "${BLUE}📥 Téléchargement de la configuration...${NC}"
curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/laHonda27/stocktrader/main/docker-compose.production.yml

# Lancer l'application
echo -e "${BLUE}🚀 Lancement de StockTrader...${NC}"
docker-compose up -d

echo -e "${BLUE}⏳ Initialisation des services (30 secondes)...${NC}"
sleep 30

# Vérifier que tout fonctionne
echo -e "${BLUE}🔍 Vérification des services...${NC}"

if curl -f http://localhost:5172/health &>/dev/null; then
    echo -e "${GREEN}✅ API Backend: Opérationnel${NC}"
else
    echo -e "${YELLOW}⚠️ API Backend: En cours de démarrage...${NC}"
fi

if curl -f http://localhost:3000/health &>/dev/null; then
    echo -e "${GREEN}✅ Frontend: Opérationnel${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend: En cours de démarrage...${NC}"
fi

echo ""
echo -e "${GREEN}🎉 StockTrader est prêt !${NC}"
echo ""
echo -e "${BLUE}🔗 Liens d'accès :${NC}"
echo -e "   🌐 Application:     ${YELLOW}http://localhost:3000${NC}"
echo -e "   📚 API Swagger:     ${YELLOW}http://localhost:5172/swagger${NC}"
echo -e "   ❤️ Health Check:    ${YELLOW}http://localhost:5172/health${NC}"
echo ""
echo -e "${BLUE}👤 Compte de demo :${NC}"
echo -e "   📧 Email: demo@stocktrader.com"
echo -e "   🔐 Mot de passe: Demo123!"
echo ""
echo -e "${BLUE}🛑 Pour arrêter :${NC}"
echo -e "   docker-compose down"
echo ""
echo -e "${YELLOW}💼 Projet portfolio - Démonstration des compétences Full-Stack${NC}"