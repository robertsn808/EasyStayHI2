# EasyStay HI - Property Management System

## Overview

EasyStay HI is a comprehensive property management system designed for short-term rental properties in Hawaii. The application features biometric authentication, tenant portals, payment tracking, maintenance management, and an AI-powered chatbot for tenant inquiries. Built with modern web technologies, it supports multi-building operations with specialized dashboards for property managers and tenants.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js with custom middleware
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Authentication**: Multi-layer auth with WebAuthn biometric support and admin credentials

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for both local development and Azure production)
- **Session Store**: PostgreSQL sessions table for persistent login sessions
- **File Storage**: Express static file serving for attachments and assets

## Key Components

### Authentication System
- **Biometric Authentication**: WebAuthn implementation for fingerprint/face ID login
- **Admin Authentication**: Credential-based admin access with session management
- **Tenant Portal Access**: PIN-based or QR code access for tenant portals
- **Cross-tab Synchronization**: BroadcastChannel API for real-time updates across browser tabs

### Property Management
- **Multi-building Support**: Manages two primary properties (934 Kapahulu Ave, 949 Kawaiahao St)
- **Room Management**: Comprehensive room status tracking, occupancy management
- **Guest Profiles**: Detailed tenant information and rental history
- **Payment Tracking**: Bill payment status, rent collection, expense management

### Maintenance & Operations
- **Request Management**: Maintenance request tracking with priority levels
- **AI-Powered Predictions**: Machine learning integration for predictive maintenance
- **Vendor Management**: Service provider coordination
- **Emergency Protocols**: Quick access emergency contact system

### AI Integration
- **Tenant Chatbot**: RapidAPI-powered AI assistant for tenant inquiries
- **Fallback AI**: Local knowledge base for property-specific questions
- **Context-Aware Responses**: Different modes for tenant, maintenance, and payment inquiries

## Data Flow

### Tenant Portal Access
1. Tenant scans QR code or enters room number
2. PIN verification or biometric authentication
3. Session creation with encrypted token storage
4. Real-time dashboard with payment status, maintenance requests, announcements

### Admin Operations
1. Biometric or credential-based admin login
2. Multi-tab dashboard with real-time data synchronization
3. CRUD operations on rooms, guests, payments, maintenance
4. Analytics and reporting with visual charts (Recharts)

### Payment Processing
1. Payment status tracking per tenant
2. Multiple payment method support (CashApp, bank transfer, etc.)
3. Automated notifications for overdue payments
4. Financial reporting and analytics

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling for Neon/Azure compatibility
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **express**: Web server framework with session middleware
- **passport**: Authentication middleware for OpenID Connect

### UI/UX Libraries
- **@radix-ui/***: Accessible component primitives (dialogs, dropdowns, etc.)
- **tailwindcss**: Utility-first CSS framework
- **recharts**: Data visualization charts for analytics
- **lucide-react**: Icon library for consistent iconography

### Authentication & Security
- **connect-pg-simple**: PostgreSQL session store
- **jsonwebtoken**: JWT token generation for tenant sessions
- **qrcode**: QR code generation for tenant portal access

### AI & Integration
- **node-fetch**: HTTP client for external API calls
- **ws**: WebSocket support for real-time updates

## Deployment Strategy

### Azure Production Deployment
- **Platform**: Azure App Service with Node.js 18 runtime
- **Database**: Azure Database for PostgreSQL Flexible Server
- **Configuration**: Environment-based settings with production security headers
- **SSL**: HTTPS-only with custom domain support
- **Scaling**: Autoscale deployment target for demand-based scaling

### Security Configuration
- **HTTPS Enforcement**: Production force HTTPS with HSTS headers
- **Proxy Trust**: Azure App Service proxy configuration
- **Session Security**: Secure cookies with SameSite protection
- **CORS**: Configurable origin restrictions for production domains

### Build Process
1. Vite builds optimized client bundle to `dist/public`
2. ESBuild compiles server TypeScript to `dist/index.js`
3. Azure deployment via GitHub Actions or direct deployment
4. Database migrations via `drizzle-kit push`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure session encryption key
- `WEBAUTHN_RP_NAME`: WebAuthn relying party identifier
- `CORS_ORIGIN`: Production domain for CORS configuration
- `RAPIDAPI_KEY`: AI chatbot service authentication

## Changelog
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.