#!/bin/bash

# Azure Database Setup Script for EasyStay HI
# Run this script in VS Code terminal or bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
RESOURCE_GROUP="easystay-hi-rg"
DB_SERVER_NAME="easystay-hi-db-$(date +%s)"  # Add timestamp for uniqueness
LOCATION="westus2"
ADMIN_USERNAME="easystay_admin"
DB_NAME="easystay_production"
APP_SERVICE_NAME="easystay-hi"

echo -e "${BLUE}🚀 Azure Database Setup for EasyStay HI${NC}"
echo "=========================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first:${NC}"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Logging in...${NC}"
    az login
fi

# Get admin password
echo -e "${YELLOW}🔑 Enter a strong password for database admin:${NC}"
read -s ADMIN_PASSWORD
echo

# Validate password
if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
    echo -e "${RED}❌ Password must be at least 8 characters long${NC}"
    exit 1
fi

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

echo -e "${BLUE}📋 Configuration:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Database Server: $DB_SERVER_NAME"
echo "Location: $LOCATION"
echo "Admin Username: $ADMIN_USERNAME"
echo "Database Name: $DB_NAME"
echo

# Step 1: Create Resource Group
echo -e "${BLUE}1️⃣  Creating resource group...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Step 2: Create PostgreSQL Server
echo -e "${BLUE}2️⃣  Creating PostgreSQL server (this may take 5-10 minutes)...${NC}"
az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_SERVER_NAME \
    --location $LOCATION \
    --admin-user $ADMIN_USERNAME \
    --admin-password "$ADMIN_PASSWORD" \
    --sku-name Standard_B2s \
    --tier Burstable \
    --storage-size 32 \
    --version 14 \
    --public-access 0.0.0.0 \
    --output table

echo -e "${GREEN}✅ PostgreSQL server created successfully!${NC}"

# Step 3: Configure Firewall Rules
echo -e "${BLUE}3️⃣  Configuring firewall rules...${NC}"

# Allow Azure services
az postgres flexible-server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_SERVER_NAME \
    --rule-name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 \
    --output table

# Get current IP and add it
CURRENT_IP=$(curl -s ifconfig.me)
if [ ! -z "$CURRENT_IP" ]; then
    echo -e "${BLUE}   Adding your IP ($CURRENT_IP) to firewall...${NC}"
    az postgres flexible-server firewall-rule create \
        --resource-group $RESOURCE_GROUP \
        --name $DB_SERVER_NAME \
        --rule-name AllowCurrentIP \
        --start-ip-address $CURRENT_IP \
        --end-ip-address $CURRENT_IP \
        --output table
fi

# Step 4: Create Application Database
echo -e "${BLUE}4️⃣  Creating application database...${NC}"
az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $DB_SERVER_NAME \
    --database-name $DB_NAME \
    --output table

# Step 5: Build Connection String
DB_HOST="${DB_SERVER_NAME}.postgres.database.azure.com"
CONNECTION_STRING="postgresql://${ADMIN_USERNAME}:${ADMIN_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

echo -e "${GREEN}✅ Database setup complete!${NC}"

# Step 6: Test Connection
echo -e "${BLUE}5️⃣  Testing database connection...${NC}"
if command -v psql &> /dev/null; then
    echo "Testing connection with psql..."
    if psql "$CONNECTION_STRING" -c "SELECT version();" &> /dev/null; then
        echo -e "${GREEN}✅ Database connection successful!${NC}"
    else
        echo -e "${YELLOW}⚠️  Connection test failed, but database should be ready${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  psql not installed, skipping connection test${NC}"
fi

# Step 7: Create Environment File
echo -e "${BLUE}6️⃣  Creating environment configuration...${NC}"
cat > .env.azure << EOF
# Azure Database Configuration
DATABASE_URL=$CONNECTION_STRING
NODE_ENV=production
SESSION_SECRET=$SESSION_SECRET
TRUST_PROXY=true
FORCE_HTTPS=true

# Azure Database Details
AZURE_DB_HOST=$DB_HOST
AZURE_DB_NAME=$DB_NAME
AZURE_DB_USER=$ADMIN_USERNAME
AZURE_DB_PASSWORD=$ADMIN_PASSWORD
EOF

echo -e "${GREEN}✅ Environment file created: .env.azure${NC}"

# Step 8: Deploy Database Schema
echo -e "${BLUE}7️⃣  Deploying database schema...${NC}"
if [ -f "package.json" ]; then
    # Set environment variable for schema deployment
    export DATABASE_URL="$CONNECTION_STRING"
    
    echo "Installing dependencies if needed..."
    npm install --silent
    
    echo "Pushing database schema..."
    if npm run db:push; then
        echo -e "${GREEN}✅ Database schema deployed successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Schema deployment failed. You may need to run 'npm run db:push' manually${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  package.json not found. Run 'npm run db:push' manually after setting DATABASE_URL${NC}"
fi

# Step 9: Configure App Service (if exists)
echo -e "${BLUE}8️⃣  Checking for App Service configuration...${NC}"
if az webapp show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "Configuring App Service environment variables..."
    az webapp config appsettings set \
        --resource-group $RESOURCE_GROUP \
        --name $APP_SERVICE_NAME \
        --settings \
        DATABASE_URL="$CONNECTION_STRING" \
        NODE_ENV="production" \
        SESSION_SECRET="$SESSION_SECRET" \
        TRUST_PROXY="true" \
        FORCE_HTTPS="true" \
        --output table
    
    echo -e "${GREEN}✅ App Service configured!${NC}"
else
    echo -e "${YELLOW}⚠️  App Service '$APP_SERVICE_NAME' not found. Configure manually when created.${NC}"
fi

# Summary
echo
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "===================="
echo -e "${BLUE}Database Server:${NC} $DB_SERVER_NAME"
echo -e "${BLUE}Database Name:${NC} $DB_NAME"
echo -e "${BLUE}Connection String:${NC} (saved in .env.azure)"
echo -e "${BLUE}Admin Username:${NC} $ADMIN_USERNAME"
echo

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Keep your database password secure"
echo "2. Update your application to use the new database"
echo "3. Test your application with the Azure database"
echo "4. Deploy your application to Azure App Service"
echo

echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "Connect to database: psql \"$CONNECTION_STRING\""
echo "View in portal: az postgres flexible-server show --name $DB_SERVER_NAME --resource-group $RESOURCE_GROUP"
echo "Update schema: DATABASE_URL=\"$CONNECTION_STRING\" npm run db:push"
echo

echo -e "${GREEN}✨ Your Azure database is ready for EasyStay HI!${NC}"