# Azure Deployment Guide for EasyStay HI

This guide walks through deploying the EasyStay HI property management system with biometric authentication to Azure App Service.

## Prerequisites

1. Azure subscription
2. Azure CLI installed
3. Node.js 18+ installed locally
4. PostgreSQL database (Azure Database for PostgreSQL recommended)

## Step 1: Prepare Your Application

### 1.1 Environment Variables
Set these environment variables in Azure App Service Configuration:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your-secure-session-secret-here
WEBAUTHN_RP_NAME=EasyStay HI Admin
TRUST_PROXY=true
FORCE_HTTPS=true
```

### 1.2 Update package.json
The build script is already configured for Azure:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

## Step 2: Azure App Service Setup

### 2.1 Create Azure App Service
```bash
# Login to Azure
az login

# Create resource group
az group create --name easystay-rg --location "East US"

# Create App Service plan
az appservice plan create --name easystay-plan --resource-group easystay-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group easystay-rg --plan easystay-plan --name easystay-hi --runtime "NODE|18-lts"
```

### 2.2 Configure App Service Settings
```bash
# Set Node.js version
az webapp config appsettings set --resource-group easystay-rg --name easystay-hi --settings WEBSITE_NODE_DEFAULT_VERSION="18.17.0"

# Set startup command
az webapp config set --resource-group easystay-rg --name easystay-hi --startup-file "node dist/index.js"

# Enable HTTPS only
az webapp update --resource-group easystay-rg --name easystay-hi --https-only true
```

## Step 3: Database Setup

### 3.1 Create Azure Database for PostgreSQL
```bash
# Create PostgreSQL server
az postgres server create --resource-group easystay-rg --name easystay-db --location "East US" --admin-user dbadmin --admin-password YourSecurePassword123! --sku-name GP_Gen5_2

# Create database
az postgres db create --resource-group easystay-rg --server-name easystay-db --name easystayhi

# Configure firewall to allow Azure services
az postgres server firewall-rule create --resource-group easystay-rg --server easystay-db --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

### 3.2 Set Database Connection String
```bash
az webapp config appsettings set --resource-group easystay-rg --name easystay-hi --settings DATABASE_URL="postgresql://dbadmin@easystay-db:YourSecurePassword123!@easystay-db.postgres.database.azure.com:5432/easystayhi?sslmode=require"
```

## Step 4: Biometric Authentication Configuration

### 4.1 Set WebAuthn Environment Variables
```bash
az webapp config appsettings set --resource-group easystay-rg --name easystay-hi --settings \
  WEBAUTHN_RP_NAME="EasyStay HI Admin" \
  TRUST_PROXY="true" \
  FORCE_HTTPS="true" \
  SESSION_SECRET="your-very-secure-session-secret-here"
```

### 4.2 SSL/TLS Requirements
Biometric authentication requires HTTPS. Azure App Service provides this automatically, but ensure:
- HTTPS Only is enabled
- Custom domain (if used) has valid SSL certificate
- No mixed content warnings

## Step 5: Deploy Application

### 5.1 Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Azure (using ZIP deployment)
az webapp deployment source config-zip --resource-group easystay-rg --name easystay-hi --src deployment.zip
```

### 5.2 Alternative: GitHub Actions Deployment
Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'easystay-hi'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

## Step 6: Post-Deployment Setup

### 6.1 Initialize Database
After deployment, run database migrations:
```bash
# SSH into Azure App Service and run
npm run db:push
```

### 6.2 Test Biometric Authentication
1. Access your deployed app: `https://easystay-hi.azurewebsites.net`
2. Navigate to admin login
3. Test password authentication first
4. Register biometric authentication on supported devices
5. Test biometric login functionality

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain
```bash
# Add custom domain
az webapp config hostname add --webapp-name easystay-hi --resource-group easystay-rg --hostname yourdomain.com

# Bind SSL certificate
az webapp config ssl bind --certificate-thumbprint <thumbprint> --ssl-type SNI --name easystay-hi --resource-group easystay-rg
```

## Security Considerations

### Production Security Checklist
- [ ] Environment variables properly set
- [ ] Database uses SSL connections
- [ ] HTTPS Only enabled
- [ ] Strong session secrets configured
- [ ] Firewall rules configured for database
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented

### Biometric Authentication Security
- [ ] HTTPS enforced (required for WebAuthn)
- [ ] Proper origin validation
- [ ] Secure credential storage
- [ ] Device management enabled
- [ ] Fallback authentication available

## Monitoring and Maintenance

### Application Insights
Enable Application Insights for monitoring:
```bash
az webapp config appsettings set --resource-group easystay-rg --name easystay-hi --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key-here"
```

### Log Streaming
View real-time logs:
```bash
az webapp log tail --resource-group easystay-rg --name easystay-hi
```

## Troubleshooting

### Common Issues
1. **Biometric auth not working**: Ensure HTTPS is enabled and no mixed content
2. **Database connection errors**: Check connection string and firewall rules
3. **Build failures**: Verify Node.js version and dependencies
4. **Session issues**: Check session secret configuration

### Debug Commands
```bash
# Check app settings
az webapp config appsettings list --resource-group easystay-rg --name easystay-hi

# View logs
az webapp log show --resource-group easystay-rg --name easystay-hi

# Restart app
az webapp restart --resource-group easystay-rg --name easystay-hi
```

## Support

For Azure-specific issues, consult:
- Azure App Service documentation
- Azure Database for PostgreSQL documentation
- WebAuthn browser compatibility tables