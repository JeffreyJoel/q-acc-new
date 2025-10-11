import { ethers } from 'ethers';

import { MODULE_ABI, ORCHESTRATOR_LIST_MODULES_ABI } from '../lib/abi/inverter';

interface PaymentAddresses {
  paymentRouterAddress: string | null;
  paymentProcessorAddress: string | null;
}

/**
 * Gets payment processor and payment router addresses from orchestrator contract
 * @param orchestratorAddress - The orchestrator contract address
 * @param rpcUrl - Optional RPC URL (defaults to Polygon mainnet)
 * @returns Object containing paymentRouterAddress and paymentProcessorAddress
 */
export async function getPaymentAddresses(
  orchestratorAddress: string,
  rpcUrl: string = 'https://polygon-rpc.com'
): Promise<PaymentAddresses> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const orchestratorContract = new ethers.Contract(
      orchestratorAddress,
      ORCHESTRATOR_LIST_MODULES_ABI,
      provider
    );

    // Get list of modules
    const modules = await orchestratorContract.listModules();
    // console.log("Found modules:", modules);

    let paymentRouterAddress: string | null = null;
    let paymentProcessorAddress: string | null = null;

    // Iterate through modules to find payment router and payment processor
    for (const module of modules) {
      const moduleContract = new ethers.Contract(module, MODULE_ABI, provider);

      try {
        const moduleName = await moduleContract.title();
        // console.log(`Module ${module} has title: ${moduleName}`);

        if (moduleName === 'LM_PC_PaymentRouter_v1') {
          //   console.log(`Found Payment Router at address: ${module}`);
          paymentRouterAddress = module;
        } else if (
          moduleName === 'PP_Streaming_v1' ||
          moduleName === 'PP_Simple_v1' ||
          moduleName.startsWith('PP_')
        ) {
          //   console.log(`Found Payment Processor at address: ${module}`);
          paymentProcessorAddress = module;
        }

        // If we found both, we can break early
        if (paymentRouterAddress && paymentProcessorAddress) {
          break;
        }
      } catch (error) {
        console.log(
          `Could not get title for module ${module}:`,
          (error as Error).message
        );
        continue;
      }
    }

    // if (!paymentRouterAddress) {
    //   console.warn("Payment Router module not found");
    // }

    // if (!paymentProcessorAddress) {
    //   console.warn("Payment Processor module not found");
    // }

    return {
      paymentRouterAddress,
      paymentProcessorAddress,
    };
  } catch (error) {
    console.error('Error getting payment addresses:', error);
    throw error;
  }
}
