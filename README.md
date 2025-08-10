# PG Management System
A modern React application built with TypeScript, Vite, and shadcn/ui for managing room rentals and tenant information.

## Features

- **Tenant Dashboard**: View room preferences and rent status
- **Admin Dashboard**: Overview of rooms, tenants, and rent collection
- **Room Management**: Manage different room types and their occupancy
- **Tenant Management**: Handle tenant information and status

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icons

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   ├── AdminDashboard.tsx
│   ├── Navbar.tsx
│   ├── RoomManagement.tsx
│   ├── TenantDashboard.tsx
│   └── TenantManagement.tsx
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository or create a new project directory
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Components Overview

### TenantDashboard
- Room preference selection with checkboxes
- Rent status table showing payment history
- Interactive room preference management

### AdminDashboard
- Overview cards for rooms, tenants, and rent
- Breadcrumb navigation
- Clean admin interface

### RoomManagement
- Table showing room types, capacity, occupancy, and status
- Add new room functionality
- Status badges for room availability

### TenantManagement
- Tenant information table with search functionality
- Add new tenant capability
- Status tracking for active/inactive tenants

## Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistent design
- **Inter font** for typography
- Custom CSS variables for theme colors

## TypeScript

Full TypeScript support with:
- Strict type checking
- Interface definitions for all data structures
- Type-safe component props
- Path aliases for clean imports

## Development

The project is set up with:
- Hot module replacement for fast development
- ESLint for code quality
- Path mapping for clean imports (`@/` alias)
- Responsive design with Tailwind's mobile-first approach

## Customization

- Modify theme colors in `tailwind.config.js`
- Update component styles using Tailwind utilities
- Add new components following the established patterns
- Extend interfaces in component files for additional data fields