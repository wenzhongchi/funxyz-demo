# FunXYZ Demo - Crypto Token Swap Application

## Project Overview

This is a Next.js-based web application that allows users to swap between different cryptocurrency tokens (USDT, USDC, ETH, WBTC) with real-time price information. The application features a modern UI with a token swap interface, balance management, and price calculations.

## Notable Features

1. **Token Swap Interface**: Users can swap between USDT, USDC, ETH, and WBTC tokens
2. **Real-time Price Updates**: Token prices are fetched from an external API
3. **Balance Management**: Users have default balances for each token
4. **Automatic Calculations**: Buy/sell amounts are automatically calculated based on current token prices
5. **Persistent State**: User balances are stored in local storage using Zustand
6. **Responsive Design**: Modern UI with Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (version specified in .nvmrc)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env.local` file with your API key:
   ```
   NEXT_PUBLIC_API_KEY=your_api_key_here
   ```

### Running the Application

```bash
yarn dev
```

The application will be available at http://localhost:5074

## Design Choices & Assumptions

### Architecture

- **Next.js**: Chosen for its server-side rendering capabilities and modern React features
- **Zustand**: Selected for state management due to its simplicity and persistence capabilities
- **Tailwind CSS**: Used for styling to ensure a consistent and responsive design

### Token Handling

- Default balances are provided for demonstration purposes
- Token decimals are handled carefully to prevent precision errors
- Price calculations use USD as the base currency

### API Integration

- Uses @funkit/api-base for token price information
- Implements error handling for API failures
- Provides fallback values when API calls fail

## Libraries Used

1. **Next.js (15.3.1)**: React framework for server-rendered applications
2. **React (19.0.0)**: UI library
3. **Zustand (5.0.3)**: State management with persistence
4. **ethers (6.13.5)**: Ethereum utilities for token calculations
5. **Tailwind CSS (4)**: Utility-first CSS framework
6. **@funkit/api-base (1.1.0)**: API client for token price information
7. **@radix-ui**: UI component primitives for accessible interfaces

## Assumptions

1. Users have a basic understanding of cryptocurrency trading
2. The application is for demonstration purposes only
3. Token prices are fetched from a reliable API source
4. Default balances are provided for testing purposes
5. The application focuses on the swap functionality rather than wallet integration

## Future Improvements

1. Add wallet integration for real transactions
2. Implement transaction history
3. Add more token pairs
4. Enhance error handling and user feedback
5. Implement price charts and market data
