import type { Hex } from "viem";

import { PING_PONG_ARTIFACT, WORMHOLE_CORE_ADDRESS } from "./constants.ts";
import { provider, wallet } from "./utils.ts";

export async function deploy() {
  const { abi, bytecode } = PING_PONG_ARTIFACT;

  // Deploy the contract
  const hash = await wallet.deployContract({
    abi,
    bytecode: bytecode as Hex,
    args: [WORMHOLE_CORE_ADDRESS],
  });

  // Wait for transaction receipt
  const receipt = await provider.waitForTransactionReceipt({
    hash,
  });

  console.log(`PingPong contract deployed!`);
  console.log(`Addr: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}
