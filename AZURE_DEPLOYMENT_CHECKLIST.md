# Azure Deployment Checklist for EasyStay HI

## Pre-Deployment Setup

### 1. Azure Resources
- [ ] Create Azure App Service (Node.js 18 LTS)
- [ ] Create Azure Database for PostgreSQL Flexible Server
- [ ] Configure App Service settings:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (PostgreSQL connection string)
  - [ ] `SESSION_SECRET` (secure random string)
  - [ ] `TRUST_PROXY=true`
  - [ ] `FORCE_HTTPS=true`

### 2. Database Setup
- [ ] Create database schema using `npm run db:push`
- [ ] Verify biometric_credentials table exists
- [ ] Test database connectivity

### 3. Security Configuration
- [ ] Enable HTTPS Only in Azure App Service
- [ ] Configure custom domain with SSL (if applicable)
- [ ] Set up proper CORS origins
- [ ] Verify WebAuthn compatibility requirements

## Biometric Authentication Requirements

### Browser Compatibility
- [ ] Chrome 67+ (Desktop/Mobile)
- [ ] Firefox 60+ (Desktop/Mobile)  
- [ ] Safari 14+ (Desktop/Mobile)
- [ ] Edge 18+ (Desktop/Mobile)

### Device Requirements
- [ ] HTTPS connection (mandatory)
- [ ] Platform authenticator available
- [ ] Biometric sensors (fingerprint/face recognition)
- [ ] Secure context (no mixed content)

### Azure-Specific Configuration
- [ ] App Service configured for HTTPS only
- [ ] Proper domain validation for WebAuthn
- [ ] Trust proxy settings enabled
- [ ] Security headers configured

## Deployment Process

### 1. GitHub Actions Setup
- [ ] Add `AZURE_WEBAPP_PUBLISH_PROFILE` secret
- [ ] Configure workflow for main/production branches
- [ ] Test deployment pipeline

### 2. Application Build
- [ ] Frontend builds successfully
- [ ] Backend compiles without errors
- [ ] All dependencies included in production package
- [ ] Environment variables properly configured

### 3. Post-Deployment Verification
- [ ] Health check endpoint responds (`/api/health`)
- [ ] Admin login works (password authentication)
- [ ] Database connectivity verified
- [ ] Static assets load correctly

## Biometric Authentication Testing

### 1. Registration Flow
- [ ] Access admin login page over HTTPS
- [ ] Login with password authentication
- [ ] Navigate to Settings > Security
- [ ] Register biometric device successfully
- [ ] Verify device appears in management list

### 2. Authentication Flow
- [ ] Logout from admin panel
- [ ] Access admin login page
- [ ] Switch to Biometric tab
- [ ] Complete biometric authentication
- [ ] Verify successful login and dashboard access

### 3. Device Management
- [ ] View registered devices
- [ ] Remove biometric devices
- [ ] Re-register devices
- [ ] Handle authentication failures gracefully

## Production Monitoring

### 1. Application Insights
- [ ] Configure Application Insights
- [ ] Set up performance monitoring
- [ ] Enable error tracking
- [ ] Configure custom metrics

### 2. Log Monitoring
- [ ] Application logs accessible
- [ ] Error logs captured
- [ ] Performance metrics tracked
- [ ] Security events logged

### 3. Alerts Configuration
- [ ] High error rate alerts
- [ ] Performance degradation alerts
- [ ] Database connectivity alerts
- [ ] Failed authentication alerts

## Security Validation

### 1. HTTPS Configuration
- [ ] All pages served over HTTPS
- [ ] No mixed content warnings
- [ ] Proper SSL certificate configuration
- [ ] HSTS headers enabled

### 2. WebAuthn Security
- [ ] Proper origin validation
- [ ] Secure credential storage
- [ ] Challenge/response validation
- [ ] Replay attack prevention

### 3. Session Security
- [ ] Secure session cookies
- [ ] Proper session expiration
- [ ] CSRF protection enabled
- [ ] XSS protection headers

## Troubleshooting Common Issues

### Biometric Authentication Failures
1. **"Not supported on this device"**
   - Check browser compatibility
   - Verify HTTPS connection
   - Ensure no mixed content

2. **"No biometric sensors detected"**
   - Verify device has fingerprint/face recognition
   - Check browser permissions
   - Test with different browser

3. **Registration fails**
   - Check admin authentication
   - Verify API endpoints accessible
   - Check browser console for errors

### Azure Deployment Issues
1. **Build failures**
   - Verify Node.js version compatibility
   - Check dependency versions
   - Review build logs

2. **Runtime errors**
   - Check environment variables
   - Verify database connection
   - Review application logs

3. **Performance issues**
   - Enable Application Insights
   - Check resource utilization
   - Optimize database queries

## Final Verification Steps

- [ ] Complete biometric authentication flow works end-to-end
- [ ] All admin features accessible after biometric login
- [ ] Cross-browser compatibility verified
- [ ] Mobile device compatibility tested
- [ ] Security headers properly configured
- [ ] Performance acceptable under load
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures documented