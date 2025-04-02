import { UniversalAddress } from "@wormhole-foundation/sdk";
import { type Hex, createPublicClient, createWalletClient, getContract, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { PING_PONG_ABI, PING_PONG_ADDRESS } from "./constants.ts";

export const chain = base;
export const provider = createPublicClient({
  chain,
  transport: http(),
});
export const wallet = createWalletClient({
  account: mnemonicToAccount(process.env.EMV_MNEMONIC as Hex),
  chain,
  transport: http(),
});

export const pingPongContract = getContract({
  address: PING_PONG_ADDRESS,
  abi: PING_PONG_ABI,
  client: { wallet, public: provider },
});

export const emitter = new UniversalAddress(pingPongContract.address);
