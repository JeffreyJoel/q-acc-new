import { Address, parseEther, parseUnits, encodeFunctionData } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { KernelAccountClient } from '@zerodev/sdk';

import config from '@/config/configuration';
import proxyContractABI from '@/lib/abi/proxyContract';
import WRAPPED_POL_ABI from '@/lib/abi/wrappedPol';
import {
  executePOLWrappingFlow,
  unwrapWPOL,
  checkWPOLBalance,
} from '@/services/polWrapping.service';

// Standard ERC20 ABI for approval
const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export interface BuyParams {
  targetContract: string;
  collateralToken: string;
  depositAmount: string;
  minAmountOut: string;
}


/**
 * Execute bundled POL operations: wrap + approve + buy in single transaction
 */
export async function executeBundledPOLFlow(
  kernelClient: KernelAccountClient,
  publicClient: any,
  smartAccountAddress: string,
  proxyAddress: string,
  collateralToken: string,
  bondingCurveAddress: string,
  depositAmount: string,
  minAmountOut: string,
  onStatusUpdate?: (status: string) => void
): Promise<{ wrapHash: string; approvalHash: string; buyHash: string }> {
  try {
    // Create all the calls for the bundled transaction
    const calls = [];

    // 1. Wrap POL to WPOL
    const wrapData = encodeFunctionData({
      abi: WRAPPED_POL_ABI,
      functionName: 'deposit',
      args: [],
    });

    calls.push({
      to: collateralToken as Address,
      data: wrapData,
      value: parseEther(depositAmount),
    });

    // 2. Approve proxy to spend WPOL
    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [proxyAddress as Address, parseEther(depositAmount)],
    });

    calls.push({
      to: collateralToken as Address,
      data: approveData,
      value: BigInt(0),
    });

    // 3. Execute buy through proxy
    const buyData = encodeFunctionData({
      abi: proxyContractABI,
      functionName: 'buy',
      args: [
        bondingCurveAddress as Address,
        collateralToken as Address,
        parseEther(depositAmount),
        parseEther(minAmountOut),
      ],
    });

    calls.push({
      to: proxyAddress as Address,
      data: buyData,
      value: BigInt(0),
    });

    // Execute all calls in single sponsored transaction
    const hash = await kernelClient.sendTransaction({
      calls,
    } as any);

    return { wrapHash: hash, approvalHash: hash, buyHash: hash };
  } catch (error) {
    console.error('Error in bundled POL flow:', error);
    throw error;
  }
}

/**
 * Check if the proxy contract has sufficient allowance to spend tokens
 */
export async function checkAllowance(
  publicClient: any,
  tokenAddress: string,
  spenderAddress: string,
  userAddress: string,
  amount: string
): Promise<boolean> {
  try {
    const allowance = await publicClient.readContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress as Address, spenderAddress as Address],
    });

    const requiredAmount = parseEther(amount);
    return allowance >= requiredAmount;
  } catch (error) {
    console.error('Error checking allowance:', error);
    return false;
  }
}

/**
 * Approve the proxy contract to spend tokens
 */
export async function approveProxy(
  kernelClient: KernelAccountClient,
  tokenAddress: string,
  spenderAddress: string,
  amount: string
): Promise<string> {
  try {
    const amountWei = parseUnits(amount, 18);

    // Encode the approve function call
    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress as Address, amountWei],
    });

    // Send transaction using smart account
    const hash = await kernelClient.sendTransaction({
      calls: [
        {
          to: tokenAddress as Address,
          data: approveData,
          value: BigInt(0),
        },
      ],
    } as any);

    return hash;
  } catch (error) {
    console.error('Error approving proxy:', error);
    throw error;
  }
}

/**
 * Buy tokens through the proxy contract
 */
export async function buyThroughProxy(
  kernelClient: KernelAccountClient,
  proxyAddress: string,
  buyParams: {
    targetContract: string;
    collateralToken: string;
    depositAmount: string;
    minAmountOut: string;
  }
): Promise<string> {
  try {
    // Encode the buy function call
    const buyData = encodeFunctionData({
      abi: proxyContractABI,
      functionName: 'buy',
      args: [
        buyParams.targetContract as Address,
        buyParams.collateralToken as Address,
        parseEther(buyParams.depositAmount),
        parseEther(buyParams.minAmountOut),
      ],
    });

    // Send transaction using smart account
    const hash = await kernelClient.sendTransaction({
      calls: [
        {
          to: proxyAddress as Address,
          data: buyData,
          value: BigInt(0),
        },
      ],
    } as any);

    return hash;
  } catch (error) {
    console.error('Error buying through proxy:', error);
    throw error;
  }
}

/**
 * Sell tokens through the proxy contract
 */
export async function sellThroughProxy(
  kernelClient: KernelAccountClient,
  proxyAddress: string,
  sellParams: {
    targetContract: string;
    tokenToSell: string;
    depositAmount: string;
    minAmountOut: string;
  }
): Promise<string> {
  try {
    // Encode the sell function call
    const sellData = encodeFunctionData({
      abi: proxyContractABI,
      functionName: 'sell',
      args: [
        sellParams.targetContract as Address,
        sellParams.tokenToSell as Address,
        parseEther(sellParams.depositAmount),
        parseEther(sellParams.minAmountOut),
      ],
    });

    // Send transaction using smart account
    const hash = await kernelClient.sendTransaction({
      calls: [
        {
          to: proxyAddress as Address,
          data: sellData,
          value: BigInt(0),
        },
      ],
    } as any);

    return hash;
  } catch (error) {
    console.error('Error selling through proxy:', error);
    throw error;
  }
}

/**
 * Complete buy flow: check allowance, approve if needed, then buy
 */
export async function executeBuyFlow(
  publicClient: any,
  kernelClient: KernelAccountClient,
  smartAccountAddress: string,
  userAddress: string,
  bondingCurveAddress: string,
  depositAmount: string,
  minAmountOut: string,
  onStatusUpdate?: (status: string) => void,
  payWithWPOL: boolean = false
): Promise<{ wrapHash?: string; approvalHash?: string; buyHash: string }> {
  try {
    const collateralToken = config.BONDING_CURVE_COLLATERAL_TOKEN;
    const proxyAddress = config.PROXY_CONTRACT_ADDRESS;

    let wrapHash: string | undefined;
    let approvalHash: string | undefined;
    let buyHash: string;

    if (payWithWPOL) {
      onStatusUpdate?.('Checking WPOL balance...');
      const wpolBalance = await checkWPOLBalance(publicClient, smartAccountAddress);
      if (parseFloat(wpolBalance) < parseFloat(depositAmount)) {
        throw new Error(
          `Insufficient WPOL balance. Available: ${wpolBalance} WPOL`
        );
      }

      const hasAllowance = await checkAllowance(
        publicClient,
        collateralToken,
        proxyAddress,
        smartAccountAddress,
        depositAmount
      );

      if (!hasAllowance) {
        onStatusUpdate?.('Approving WPOL spend...');
        approvalHash = await approveProxy(
          kernelClient,
          collateralToken,
          proxyAddress,
          depositAmount
        );

        const approvalReceipt = await waitForTransactionReceipt(publicClient, {
          hash: approvalHash as Address,
        });

        if (approvalReceipt.status === 'reverted') {
          throw new Error('Approval transaction failed');
        }

        onStatusUpdate?.('Approval confirmed');
      } else {
        onStatusUpdate?.('Sufficient allowance exists');
      }

      onStatusUpdate?.('Executing buy...');
      buyHash = await buyThroughProxy(
        kernelClient,
        proxyAddress,
        {
          targetContract: bondingCurveAddress,
          collateralToken,
          depositAmount,
          minAmountOut,
        }
      );

      onStatusUpdate?.('Waiting for buy confirmation...');
      const buyReceipt = await waitForTransactionReceipt(publicClient, {
        hash: buyHash as Address,
      });

      if (buyReceipt.status === 'reverted') {
        throw new Error('Buy transaction failed');
      }
    } else {
      // Execute bundled transaction: wrap + approve + buy (sponsored)
      // Assumes POL has already been transferred to smart account
      onStatusUpdate?.('Executing bundled operations...');
      const bundledResult = await executeBundledPOLFlow(
        kernelClient,
        publicClient,
        smartAccountAddress,
        proxyAddress,
        collateralToken,
        bondingCurveAddress,
        depositAmount,
        minAmountOut,
        onStatusUpdate
      );

      wrapHash = bundledResult.wrapHash;
      approvalHash = bundledResult.approvalHash;
      buyHash = bundledResult.buyHash;
    }

    onStatusUpdate?.('Buy complete!');

    return { wrapHash, approvalHash, buyHash };
  } catch (error) {
    console.error('Error in buy flow:', error);
    onStatusUpdate?.('Buy failed');
    throw error;
  }
}

/**
 * Complete sell flow: check allowance, approve if needed, then sell
 */
export async function executeSellFlow(
  publicClient: any,
  kernelClient: KernelAccountClient,
  smartAccountAddress: string,
  userAddress: string,
  bondingCurveAddress: string,
  tokenToSell: string,
  depositAmount: string,
  minAmountOut: string,
  onStatusUpdate?: (status: string) => void,
  skipUnwrap: boolean = false
): Promise<{ approvalHash?: string; sellHash: string; unwrapHash?: string }> {
  try {
    const proxyAddress = config.PROXY_CONTRACT_ADDRESS;

    onStatusUpdate?.('Checking allowance...');

    const hasAllowance = await checkAllowance(
      publicClient,
      tokenToSell,
      proxyAddress,
      smartAccountAddress,
      depositAmount
    );

    let approvalHash: string | undefined;

    if (!hasAllowance) {
      onStatusUpdate?.('Approving token spend...');
      approvalHash = await approveProxy(
        kernelClient,
        tokenToSell,
        proxyAddress,
        depositAmount
      );

      onStatusUpdate?.('Waiting for approval confirmation...');
      const approvalReceipt = await waitForTransactionReceipt(publicClient, {
        hash: approvalHash as Address,
      });

      if (approvalReceipt.status === 'reverted') {
        throw new Error('Approval transaction failed');
      }

      onStatusUpdate?.('Approval confirmed');
    } else {
      onStatusUpdate?.('Sufficient allowance exists');
    }

    onStatusUpdate?.('Executing sell...');
    const sellHash = await sellThroughProxy(
      kernelClient,
      proxyAddress,
      {
        targetContract: bondingCurveAddress,
        tokenToSell,
        depositAmount,
        minAmountOut,
      }
    );

    onStatusUpdate?.('Waiting for sell confirmation...');
    const sellReceipt = await waitForTransactionReceipt(publicClient, {
      hash: sellHash as Address,
    });

    if (sellReceipt.status === 'reverted') {
      throw new Error('Sell transaction failed');
    }

    onStatusUpdate?.('Sell complete');

    let unwrapHash: string | undefined;

    if (!skipUnwrap) {
      onStatusUpdate?.('Unwrapping WPOL to POL...');

      // Get sell receipt for logs
      const sellReceiptFull = await publicClient.getTransactionReceipt({
        hash: sellHash as Address,
      });

      // Find WPOL transfer to user
      const wpolTransferLogs = sellReceiptFull.logs.filter(
        (log: any) =>
          log.address.toLowerCase() ===
            config.BONDING_CURVE_COLLATERAL_TOKEN.toLowerCase() &&
          log.topics[0] ===
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );

      const userTransferLog = wpolTransferLogs.find((log: any) => {
        const toAddress = '0x' + log.topics[2].slice(26);
        return toAddress.toLowerCase() === userAddress.toLowerCase();
      });

      let wpolAmount = '0';
      if (userTransferLog) {
        wpolAmount = (Number(userTransferLog.data) / 1e18).toString();
      }

      if (parseFloat(wpolAmount) > 0) {
        unwrapHash = await unwrapWPOL(
          kernelClient,
          wpolAmount,
          onStatusUpdate
        );

        onStatusUpdate?.('Waiting for unwrap confirmation...');
        const unwrapReceipt = await waitForTransactionReceipt(publicClient, {
          hash: unwrapHash as Address,
        });

        if (unwrapReceipt.status === 'reverted') {
          throw new Error('Unwrap transaction failed');
        }

        onStatusUpdate?.('Unwrap complete');
      } else {
        onStatusUpdate?.('No WPOL to unwrap');
      }
    } else {
      onStatusUpdate?.('Received WPOL');
    }

    return { approvalHash, sellHash, unwrapHash };
  } catch (error) {
    console.error('Error in sell flow:', error);
    onStatusUpdate?.('Sell failed');
    throw error;
  }
}
