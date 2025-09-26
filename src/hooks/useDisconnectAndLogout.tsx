import { usePrivy } from '@privy-io/react-auth';
import { useAccountEffect, useDisconnect } from 'wagmi';

export const useDisconnectAndLogout = () => {
  const { authenticated, logout } = usePrivy();
  const { disconnect } = useDisconnect();
  useAccountEffect({
    onDisconnect: () => {
      if (authenticated) {
        logout().catch(() => {});
      }
    },
  });
  return {
    disconnect,
  };
};
