# Azure Database Setup Script for EasyStay HI (PowerShell)
# Run this script in VS Code PowerShell terminal

param(
    [string]$ResourceGroup = "easystay-hi-rg",
    [string]$Location = "westus2",
    [string]$AdminUsername = "easystay_admin",
    [string]$DatabaseName = "easystay_production",
    [string]$AppServiceName = "easystay-hi"
)

# Configuration
$DBServerName = "easystay-hi-db-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "🚀 Azure Database Setup for EasyStay HI" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

# Check if Azure CLI is installed
try {
    az --version | Out-Null
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    az account show | Out-Null
} catch {
    Write-Host "⚠️  Not logged in to Azure. Logging in..." -ForegroundColor Yellow
    az login
}

# Get admin password
$AdminPassword = Read-Host "🔑 Enter a strong password for database admin" -AsSecureString
$AdminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AdminPassword))

# Validate password
if ($AdminPasswordPlain.Length -lt 8) {
    Write-Host "❌ Password must be at least 8 characters long" -ForegroundColor Red
    exit 1
}

# Generate session secret
$SessionSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.DateTime]::Now.Ticks))

Write-Host "📋 Configuration:" -ForegroundColor Blue
Write-Host "Resource Group: $ResourceGroup"
Write-Host "Database Server: $DBServerName"
Write-Host "Location: $Location"
Write-Host "Admin Username: $AdminUsername"
Write-Host "Database Name: $DatabaseName"
Write-Host ""

# Step 1: Create Resource Group
Write-Host "1️⃣  Creating resource group..." -ForegroundColor Blue
az group create --name $ResourceGroup --location $Location --output table

# Step 2: Create PostgreSQL Server
Write-Host "2️⃣  Creating PostgreSQL server (this may take 5-10 minutes)..." -ForegroundColor Blue
az postgres flexible-server create `
    --resource-group $ResourceGroup `
    --name $DBServerName `
    --location $Location `
    --admin-user $AdminUsername `
    --admin-password $AdminPasswordPlain `
    --sku-name Standard_B2s `
    --tier Burstable `
    --storage-size 32 `
    --version 14 `
    --public-access 0.0.0.0 `
    --output table

Write-Host "✅ PostgreSQL server created successfully!" -ForegroundColor Green

# Step 3: Configure Firewall Rules
Write-Host "3️⃣  Configuring firewall rules..." -ForegroundColor Blue

# Allow Azure services
az postgres flexible-server firewall-rule create `
    --resource-group $ResourceGroup `
    --name $DBServerName `
    --rule-name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0 `
    --output table

# Get current IP and add it
try {
    $CurrentIP = (Invoke-WebRequest -Uri "https://ifconfig.me" -UseBasicParsing).Content.Trim()
    if ($CurrentIP) {
        Write-Host "   Adding your IP ($CurrentIP) to firewall..." -ForegroundColor Blue
        az postgres flexible-server firewall-rule create `
            --resource-group $ResourceGroup `
            --name $DBServerName `
            --rule-name AllowCurrentIP `
            --start-ip-address $CurrentIP `
            --end-ip-address $CurrentIP `
            --output table
    }
} catch {
    Write-Host "⚠️  Could not detect current IP. Add manually if needed." -ForegroundColor Yellow
}

# Step 4: Create Application Database
Write-Host "4️⃣  Creating application database..." -ForegroundColor Blue
az postgres flexible-server db create `
    --resource-group $ResourceGroup `
    --server-name $DBServerName `
    --database-name $DatabaseName `
    --output table

# Step 5: Build Connection String
$DBHost = "$DBServerName.postgres.database.azure.com"
$ConnectionString = "postgresql://$AdminUsername`:$AdminPasswordPlain@$DBHost`:5432/$DatabaseName`?sslmode=require"

Write-Host "✅ Database setup complete!" -ForegroundColor Green

# Step 6: Create Environment File
Write-Host "6️⃣  Creating environment configuration..." -ForegroundColor Blue
$EnvContent = @"
# Azure Database Configuration
DATABASE_URL=$ConnectionString
NODE_ENV=production
SESSION_SECRET=$SessionSecret
TRUST_PROXY=true
FORCE_HTTPS=true

# Azure Database Details
AZURE_DB_HOST=$DBHost
AZURE_DB_NAME=$DatabaseName
AZURE_DB_USER=$AdminUsername
AZURE_DB_PASSWORD=$AdminPasswordPlain
"@

$EnvContent | Out-File -FilePath ".env.azure" -Encoding UTF8
Write-Host "✅ Environment file created: .env.azure" -ForegroundColor Green

# Step 7: Deploy Database Schema
Write-Host "7️⃣  Deploying database schema..." -ForegroundColor Blue
if (Test-Path "package.json") {
    # Set environment variable for schema deployment
    $env:DATABASE_URL = $ConnectionString
    
    Write-Host "Installing dependencies if needed..."
    npm install --silent
    
    Write-Host "Pushing database schema..."
    try {
        npm run db:push
        Write-Host "✅ Database schema deployed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Schema deployment failed. You may need to run 'npm run db:push' manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  package.json not found. Run 'npm run db:push' manually after setting DATABASE_URL" -ForegroundColor Yellow
}

# Step 8: Configure App Service (if exists)
Write-Host "8️⃣  Checking for App Service configuration..." -ForegroundColor Blue
try {
    az webapp show --name $AppServiceName --resource-group $ResourceGroup | Out-Null
    Write-Host "Configuring App Service environment variables..."
    az webapp config appsettings set `
        --resource-group $ResourceGroup `
        --name $AppServiceName `
        --settings `
        DATABASE_URL=$ConnectionString `
        NODE_ENV=production `
        SESSION_SECRET=$SessionSecret `
        TRUST_PROXY=true `
        FORCE_HTTPS=true `
        --output table
    
    Write-Host "✅ App Service configured!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  App Service '$AppServiceName' not found. Configure manually when created." -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "===================="
Write-Host "Database Server: $DBServerName" -ForegroundColor Blue
Write-Host "Database Name: $DatabaseName" -ForegroundColor Blue
Write-Host "Connection String: (saved in .env.azure)" -ForegroundColor Blue
Write-Host "Admin Username: $AdminUsername" -ForegroundColor Blue
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Keep your database password secure"
Write-Host "2. Update your application to use the new database"
Write-Host "3. Test your application with the Azure database"
Write-Host "4. Deploy your application to Azure App Service"
Write-Host ""

Write-Host "🔗 Useful Commands:" -ForegroundColor Blue
Write-Host "Connect to database: psql `"$ConnectionString`""
Write-Host "View in portal: az postgres flexible-server show --name $DBServerName --resource-group $ResourceGroup"
Write-Host "Update schema: `$env:DATABASE_URL=`"$ConnectionString`"; npm run db:push"
Write-Host ""

Write-Host "✨ Your Azure database is ready for EasyStay HI!" -ForegroundColor Green