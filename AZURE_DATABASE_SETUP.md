# Azure Database Configuration for EasyStay HI

## Step 1: Create Azure Database for PostgreSQL

### Using Azure Portal
1. Go to Azure Portal → Create a resource
2. Search for "Azure Database for PostgreSQL"
3. Select "Flexible Server" (recommended)
4. Configure the following settings:

**Basic Settings:**
- Resource Group: Create new or use existing
- Server Name: `easystay-hi-db` (must be globally unique)
- Region: Choose closest to your users (e.g., West US 2)
- PostgreSQL Version: 14 or 15 (recommended)
- Workload Type: Development (for testing) or Production

**Authentication:**
- Authentication Method: PostgreSQL authentication only
- Admin Username: `easystay_admin`
- Password: Create a strong password (save this!)

**Compute + Storage:**
- Compute Tier: Burstable (B1ms for development, B2s for production)
- Storage: 32 GiB (can scale up later)
- Backup Retention: 7 days

### Using Azure CLI
```bash
# Create resource group
az group create --name easystay-hi-rg --location westus2

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group easystay-hi-rg \
  --name easystay-hi-db \
  --location westus2 \
  --admin-user easystay_admin \
  --admin-password YOUR_SECURE_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14
```

## Step 2: Configure Firewall Rules

### Allow Azure Services
```bash
# Allow Azure services to access the database
az postgres flexible-server firewall-rule create \
  --resource-group easystay-hi-rg \
  --name easystay-hi-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Allow Your IP (for development)
```bash
# Get your current IP
curl ifconfig.me

# Add your IP to firewall
az postgres flexible-server firewall-rule create \
  --resource-group easystay-hi-rg \
  --name easystay-hi-db \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS
```

## Step 3: Get Connection String

Your connection string will look like this:
```
postgresql://easystay_admin:YOUR_PASSWORD@easystay-hi-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Components:**
- Host: `easystay-hi-db.postgres.database.azure.com`
- Port: `5432`
- Database: `postgres` (default)
- Username: `easystay_admin`
- Password: Your chosen password
- SSL Mode: `require` (mandatory for Azure)

## Step 4: Configure App Service Environment Variables

### Using Azure Portal
1. Go to your App Service → Settings → Configuration
2. Add these Application Settings:

```
DATABASE_URL = postgresql://easystay_admin:YOUR_PASSWORD@easystay-hi-db.postgres.database.azure.com:5432/postgres?sslmode=require
NODE_ENV = production
SESSION_SECRET = your-random-session-secret-here
TRUST_PROXY = true
FORCE_HTTPS = true
```

### Using Azure CLI
```bash
az webapp config appsettings set \
  --resource-group easystay-hi-rg \
  --name easystay-hi \
  --settings \
  DATABASE_URL="postgresql://easystay_admin:YOUR_PASSWORD@easystay-hi-db.postgres.database.azure.com:5432/postgres?sslmode=require" \
  NODE_ENV="production" \
  SESSION_SECRET="your-random-session-secret" \
  TRUST_PROXY="true" \
  FORCE_HTTPS="true"
```

## Step 5: Initialize Database Schema

### Option 1: Using Local Development Environment
```bash
# Set your Azure database URL locally
export DATABASE_URL="postgresql://easystay_admin:YOUR_PASSWORD@easystay-hi-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Push schema to Azure database
npm run db:push
```

### Option 2: Using Azure Cloud Shell
1. Open Azure Cloud Shell
2. Clone your repository
3. Install dependencies and run migration
```bash
git clone YOUR_REPOSITORY_URL
cd easystay-hi
npm install
export DATABASE_URL="postgresql://easystay_admin:YOUR_PASSWORD@easystay-hi-db.postgres.database.azure.com:5432/postgres?sslmode=require"
npm run db:push
```

## Step 6: Security Best Practices

### Connection Security
- Always use SSL (`sslmode=require`)
- Use strong passwords (minimum 12 characters)
- Restrict firewall rules to necessary IPs only
- Consider using Azure AD authentication for production

### Database Security
```sql
-- Create application-specific database (recommended)
CREATE DATABASE easystay_production;

-- Create limited user for application
CREATE USER easystay_app WITH PASSWORD 'secure_app_password';
GRANT CONNECT ON DATABASE easystay_production TO easystay_app;
GRANT USAGE ON SCHEMA public TO easystay_app;
GRANT CREATE ON SCHEMA public TO easystay_app;
```

Updated connection string with dedicated database:
```
postgresql://easystay_app:secure_app_password@easystay-hi-db.postgres.database.azure.com:5432/easystay_production?sslmode=require
```

## Step 7: Testing Connection

### Test from Local Environment
```bash
# Install PostgreSQL client
npm install -g pg

# Test connection
psql "postgresql://easystay_admin:YOUR_PASSWORD@easystay-hi-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

### Test from Application
Create a test endpoint in your application:
```javascript
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.select().from(schema.buildings).limit(1);
    res.json({ status: 'connected', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

## Step 8: Monitoring and Maintenance

### Enable Monitoring
1. Go to Azure Portal → Your PostgreSQL server
2. Navigate to Monitoring → Metrics
3. Set up alerts for:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Connection count approaching limits
   - Failed connections

### Backup Configuration
- Azure automatically backs up your database
- Default retention: 7 days
- Can be extended up to 35 days
- Point-in-time restore available

### Performance Optimization
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('easystay_production'));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;
```

## Common Issues and Solutions

### Connection Timeout
- Check firewall rules
- Verify App Service can reach database
- Ensure SSL is properly configured

### Authentication Failed
- Verify username and password
- Check if user has proper permissions
- Ensure connection string format is correct

### SSL/TLS Issues
- Always use `sslmode=require`
- Azure PostgreSQL requires SSL connections
- Check certificate validation settings

### Performance Issues
- Monitor connection pool usage
- Check for long-running queries
- Consider read replicas for high-read workloads
- Optimize database queries and indexes

## Production Checklist

- [ ] Database server created with appropriate tier
- [ ] Firewall rules configured (minimal access)
- [ ] SSL enabled and enforced
- [ ] Backup retention configured
- [ ] Monitoring and alerts set up
- [ ] Database schema deployed
- [ ] Connection string configured in App Service
- [ ] Application can connect successfully
- [ ] Performance baseline established
- [ ] Security audit completed