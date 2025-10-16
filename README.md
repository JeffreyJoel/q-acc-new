# Q/ACC - Quadratic Accelerator Platform

Q/ACC is a blockchain-based platform for discovering, exploring, and investing in innovative projects through quadratic funding mechanisms. The platform enables users to support promising blockchain projects while leveraging advanced DeFi protocols for seamless cross-chain interactions.

## 🏗️ Architecture Overview

This Next.js application serves as a comprehensive frontend for the Q/ACC ecosystem, built with modern web technologies and blockchain integrations:

- **Frontend**: Next.js 14 with React 18, TypeScript
- **Authentication**: Privy.io for wallet-based auth
- **Smart Accounts**: ZeroDev for gasless transactions
- **Cross-chain Swaps**: Squid Router for multi-chain liquidity
- **Data Storage**: MongoDB for project metadata, IPFS for file storage
- **Analytics**: Dune Analytics integration
- **Content**: Mirror.xyz for project articles and updates

## 🛠️ Technology Stack

### Core Frameworks & Libraries

```json
{
  "next": "14.2.28",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.4.1"
}
```

### Blockchain SDKs & Integrations

#### Privy.io (`@privy-io/react-auth`, `@privy-io/wagmi`)
- **Purpose**: Handles user authentication and wallet management
- **Usage**: Enables email, wallet, Google, and Twitter login methods
- **Features**: Embedded wallets, multi-chain support, seamless UX

```typescript
// Used in PrivyProvider.tsx for authentication setup
const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    showWalletUIs: true,
  },
  loginMethods: ['wallet', 'email', 'google', 'twitter'],
  // ... more config
};
```

#### ZeroDev SDK (`@zerodev/sdk`, `@zerodev/ecdsa-validator`)
- **Purpose**: Provides smart account functionality with gas abstraction
- **Usage**: Creates Kernel v3.1 accounts with ECDSA validation
- **Features**: Gasless transactions, account abstraction, paymaster integration

```typescript
// Used in ZeroDevContext.tsx for smart account creation
const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
  signer: walletClient,
  entryPoint: { address: entryPoint07Address, version: '0.7' },
  kernelVersion: KERNEL_V3_1,
});
```

#### Squid Router (`@0xsquid/sdk`, `@0xsquid/squid-types`)
- **Purpose**: Enables cross-chain token swaps and bridging
- **Usage**: Facilitates POL token swaps for project investments
- **Features**: Multi-chain liquidity aggregation, optimized routing

```typescript
// Used in useSquidSwap.tsx hook
const squidInstance = new Squid({
  baseUrl: 'https://apiplus.squidrouter.com',
  integratorId: config.SQUID_INTEGRATOR_ID,
});
```

### UI & Styling

#### Radix UI Components
- **Purpose**: Accessible, unstyled UI primitives
- **Components**: Dialogs, dropdowns, progress bars, tabs, tooltips
- **Benefits**: Consistent design system, keyboard navigation, screen reader support

#### Tailwind CSS + Custom Design System
- **Features**: Custom color palette (peach-400, qacc-gray), responsive design
- **Typography**: Custom fonts (Tusker Grotesk, IBM Plex Mono)
- **Components**: Shadcn/ui based components with Radix primitives

### Data Management & State

#### TanStack Query (`@tanstack/react-query`)
- **Purpose**: Server state management and caching
- **Usage**: API calls, project data fetching, real-time updates
- **Benefits**: Automatic caching, background refetching, optimistic updates

#### Custom React Contexts
- **ChainProvider**: Multi-chain network management
- **DonationContext**: Donation flow state management
- **ProjectContext**: Project data and creation workflows
- **ZeroDevContext**: Smart account management

## 🔌 API Routes

The application exposes several API endpoints for data fetching and blockchain interactions:

### `/api/token-holders` (GET)
- **Purpose**: Fetch token holder data from Blockscout
- **Parameters**: `tokenAddress` (query param)
- **Response**: Token supply, holder count, top 20 holders with percentages
- **Usage**: Display token distribution in project details

### `/api/ipfs` (POST/DELETE)
- **Purpose**: File upload/download to IPFS via Pinata
- **POST**: Upload files to IPFS with metadata
- **DELETE**: Unpin files from IPFS
- **Usage**: Store project images, documents, and metadata

### `/api/mirror` (GET)
- **Purpose**: Fetch articles from Mirror.xyz
- **Response**: Array of Mirror articles with content, timestamps, and metadata
- **Usage**: Display project updates and blog posts

### `/api/dune` (GET)
- **Purpose**: Fetch analytics data from Dune Analytics
- **Response**: Protocol metrics (TVL, raised funds, market cap)
- **Usage**: Dashboard statistics and platform metrics

### `/api/projects/abc/[address]` (GET)
- **Purpose**: Retrieve ABC (Automated Bonding Curve) launch data
- **Parameters**: `address` (URL param) - project contract address
- **Response**: Token metadata, contract addresses, chain information
- **Usage**: Display project launch details and token information

### `/api/link-store` (GET)
- **Purpose**: Retrieve encrypted data stored via Privado
- **Parameters**: `id` (query param) - unique identifier
- **Usage**: Handle encrypted link sharing and private data access

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- MongoDB instance
- Environment variables (see `.env.example`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd q-acc

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```


```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (main)/            # Main application routes
│   ├── actions/           # Server actions
│   └── api/               # API routes
├── components/            # React components
│   ├── discover/         # Discovery/discover page components
│   ├── donate/           # Donation flow components
│   ├── leaderboard/      # Leaderboard components
│   ├── modals/           # Modal dialogs
│   ├── profile/          # User profile components
│   ├── project/          # Project detail components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── helpers/              # Utility functions
├── hooks/                # Custom React hooks
├── lib/                  # Core libraries and configurations
├── providers/            # React providers
├── queries/              # TanStack Query definitions
├── services/             # External API integrations
└── types/                # TypeScript type definitions
```

## 🔄 Key Workflows

### 1. User Authentication Flow
1. User connects via Privy (wallet, email, social)
2. ZeroDev creates smart account with gas abstraction
3. User can perform gasless transactions

### 2. Project Discovery & Investment
1. Browse projects via ProjectsTable component
2. View project details and metrics
3. Use Squid Router for cross-chain POL swaps
4. Execute donations through smart contracts

### 3. Content Management
1. Projects publish updates via Mirror.xyz
2. Articles fetched via `/api/mirror`
3. Content displayed in blog/news sections

### 4. Analytics Integration
1. Dune queries provide platform metrics
2. Real-time data displayed in dashboards
3. Token holder data from Blockscout API

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format with Prettier
npm run type-check      # Run TypeScript checks
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test blockchain interactions on testnets first
4. Update documentation for API changes

## 📄 License

This project is part of the Q/ACC ecosystem. See individual component licenses for details.
