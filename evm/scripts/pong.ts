import { type Chain, UniversalAddress, type WormholeMessageId, wormhole } from "@wormhole-foundation/sdk";
import { type Hex } from "viem";

import { pingPongContract } from "./utils.ts";

export async function sendPong(chain: Chain, emitter: UniversalAddress, sequence = 0n) {
  const wh = await wormhole("Mainnet", []);

  const messageId: WormholeMessageId = {
    chain,
    emitter,
    sequence,
  };

  const vaaBytes = await wh.getVaaBytes(messageId);
  if (vaaBytes === null) throw Error(`Couldn't find vaa for message id ${messageId}`);

  const vaaHex = `0x${Buffer.from(vaaBytes).toString("hex")}` as Hex;
  const txId = await pingPongContract.write.receiveMessage([vaaHex]);
  console.log(`Transaction ID: ${txId}`);
  console.log(`Wormhole scan: https://wormholescan.io/#/tx/${txId}`);
}
