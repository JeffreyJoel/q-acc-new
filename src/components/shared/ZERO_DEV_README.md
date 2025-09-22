# ZeroDev Account Abstraction Implementation

This implementation integrates ZeroDev's Kernel smart accounts with Privy for gasless USDC transfers on Polygon Amoy.

## 🚀 Features

- **Gasless Transactions**: ZeroDev sponsors all gas fees
- **Smart Account Management**: Automatic smart account creation and management
- **Seamless Integration**: Works with existing Privy wallet setup
- **Network Management**: Automatic Polygon Amoy switching
- **Enhanced Security**: Smart account provides additional security features

## 📦 Components

### `SmartUSDCTransfer`
Gasless USDC transfer component using ZeroDev smart accounts.

```tsx
import { SmartUSDCTransfer } from "@/components/shared";

<SmartUSDCTransfer />
```

### `AccountAbstractionDemo`
Demo component comparing regular vs smart account transfers.

```tsx
import { AccountAbstractionDemo } from "@/components/shared";

<AccountAbstractionDemo />
```

## 🔧 Setup

### Environment Variables
Add these to your `.env.local` file:

```env
# ZeroDev Configuration (optional - defaults provided)
NEXT_PUBLIC_ZERODEV_BUNDLER_URL=https://rpc.zerodev.app/api/v2/bundler/80002
NEXT_PUBLIC_ZERODEV_PAYMASTER_URL=https://rpc.zerodev.app/api/v2/paymaster/80002
```

### Configuration
The configuration is automatically handled in `config/production.ts` and `config/development.ts`.

## 🏗️ Architecture

### Context: `ZeroDevContext`
Manages smart account state and initialization.

```tsx
const { kernelClient, smartAccountAddress, isInitializing } = useZeroDev();
```

### Hook: `useZeroDevAccount`
Custom hook for smart account management.

```tsx
const { kernelClient, smartAccountAddress, isInitializing, error } = useZeroDevAccount();
```

### Provider Integration
Wrapped in the main `PrivyProvider` for global access.

## 🔄 How It Works

1. **Smart Account Creation**:
   - Uses Privy embedded wallet as signer
   - Creates ECDSA validator
   - Initializes Kernel account
   - Configures ZeroDev paymaster for gas sponsorship

2. **Transaction Flow**:
   - User initiates transfer
   - System ensures correct network (Polygon Amoy)
   - Creates smart account transaction
   - ZeroDev paymaster sponsors gas
   - Transaction sent via bundler

3. **Network Management**:
   - Automatic network switching
   - Real-time network status
   - Error handling for failed switches

## 🎯 USDC Transfer

### Regular Transfer
- Uses standard wallet
- Requires POL for gas
- Direct ERC-20 transfer

### Smart Account Transfer
- Uses Kernel smart account
- Gas sponsored by ZeroDev
- Enhanced transaction features

## 🔍 API Reference

### `useZeroDev()` Hook
```tsx
interface ZeroDevContextType {
  kernelClient: KernelAccountClient | null;
  smartAccountAddress: string | null;
  isInitializing: boolean;
  initializeSmartAccount: () => Promise<void>;
}
```

### `SmartUSDCTransfer` Props
```tsx
interface SmartUSDCTransferProps {
  className?: string;
  usdcAddress?: Address;
}
```

## 🛡️ Security

- **Multi-signature ready**: Kernel accounts support multi-sig
- **Upgradeable**: Smart accounts can be upgraded
- **Audited**: ZeroDev contracts are audited
- **Gas abstraction**: Users never handle gas

## 📊 Monitoring

The implementation includes comprehensive logging:
- Smart account initialization status
- Network switching events
- Transaction success/failure
- Error tracking

## 🚦 Status Indicators

- 🟢 **Green**: Connected to smart account
- 🟡 **Yellow**: Initializing
- 🔴 **Red**: Error or wrong network
- ⚡ **Green Lightning**: Gasless mode active

## 🔧 Troubleshooting

### Common Issues

1. **"Smart account not initialized"**
   - Check wallet connection
   - Verify network (Polygon Amoy)
   - Check console for errors

2. **"Failed to switch network"**
   - Manual network switch required
   - Check wallet permissions
   - Verify supported networks

3. **"Transfer failed"**
   - Check USDC balance
   - Verify recipient address
   - Check network connectivity

### Debug Mode
Add to component for debugging:
```tsx
console.log("Smart Account:", smartAccountAddress);
console.log("Kernel Client:", kernelClient);
```

## 🎉 Usage Example

```tsx
import { SmartUSDCTransfer, AccountAbstractionDemo } from "@/components/shared";

export default function TransferPage() {
  return (
    <div>
      <h1>USDC Transfer Options</h1>
      <AccountAbstractionDemo />
    </div>
  );
}
```

## 📈 Next Steps

- Add batch transactions
- Implement session keys
- Add smart account recovery
- Integrate with more DeFi protocols

---

**Built with ZeroDev Kernel + Privy Integration** 🎯
