### Rental Dashboard Backend API
A comprehensive Node.js/Express backend API with TypeScript, JWT authentication, and role-based access control for the Rental Dashboard application.

## 🏗️ Project Structure
```
backend/
├── src/
│   ├── middleware/
│   │   ├── auth.ts           # Authentication & authorization middleware
│   │   └── errorHandler.ts   # Global error handling
│   ├── routes/
│   │   ├── auth.ts          # Authentication routes
│   │   ├── admin.ts         # Admin-only routes
│   │   └── tenant.ts        # Tenant-only routes
│   ├── services/
│   │   └── mockDatabase.ts  # Mock database service
│   ├── lib/
│   │   ├── jwt.ts           # JWT utilities
│   │   ├── bcrypt.ts        # Password hashing
│   │   └── validation.ts    # Zod validation schemas
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── server.ts            # Main server file
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── Dockerfile               # Docker configuration
└── docker-compose.yml       # Docker Compose setup
```

## 🚀 Quick Start

# Initialize the project
npm init -y

# Install dependencies
npm install express cors helmet dotenv bcryptjs jsonwebtoken cookie-parser express-rate-limit express-validator zod prisma @prisma/client date-fns

# Install dev dependencies
npm install -D @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/node typescript nodemon ts-node
2. Environment Setup
bash# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
FRONTEND_URL=http://localhost:3000
3. Run the Server
bash# Development mode
npm run dev

# Production build
npm run build
npm start
📡 API Endpoints
Authentication Routes (/api/auth)
MethodEndpointDescriptionAccessPOST/loginUser loginPublicPOST/logoutUser logoutPublicGET/meGet current userAuthenticatedGET/verifyVerify tokenAuthenticated
Admin Routes (/api/admin)
MethodEndpointDescriptionAccessGET/dashboard/statsDashboard statisticsAdminGET/dashboard/activityRecent activityAdminGET/roomsGet all roomsAdminPOST/roomsCreate new roomAdminGET/rooms/:idGet room by IDAdminGET/tenantsGet all tenantsAdminPOST/tenantsCreate new tenantAdminGET/paymentsGet all paymentsAdminGET/maintenanceGet all maintenance requestsAdminPATCH/maintenance/:idUpdate maintenance requestAdmin
Tenant Routes (/api/tenant)
MethodEndpointDescriptionAccessGET/dashboardTenant dashboard dataTenantGET/paymentsPayment historyTenantPOST/payments/:id/payMake paymentTenantGET/maintenanceMaintenance requestsTenantPOST/maintenanceCreate maintenance requestTenantGET/profileUser profileTenant
🔐 Authentication & Security
JWT Authentication

Secure cookie storage for tokens
HTTP-only cookies to prevent XSS
Remember me functionality with different expiration times
Role-based access control (Admin vs Tenant)

Security Features

Helmet.js for security headers
Rate limiting to prevent abuse
CORS configuration for frontend integration
Password hashing with bcrypt (12 salt rounds)
Input validation with Zod schemas
SQL injection prevention (when using real database)

Demo Credentials
javascript// Admin Account
email: admin@rental.com
password: admin123

// Tenant Account
email: tenant@rental.com
password: tenant123
