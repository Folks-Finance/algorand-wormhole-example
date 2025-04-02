import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";

import { WORMHOLE_CORE_APP_ID } from "./constants.ts";
import { getEmitterAddress, getWallet, pingPongContract } from "./utils.ts";

export async function sendPing() {
  const emitterLogicSigAddress = await getEmitterAddress();
  const sender = await getWallet();

  const res = await pingPongContract.send.ping({
    sender,
    args: [],
    accountReferences: [emitterLogicSigAddress],
    appReferences: [WORMHOLE_CORE_APP_ID],
    staticFee: new AlgoAmount({ microAlgos: 3000 }),
  });
  console.log(`Ping sent at: ${res.transactions[0].txID()}`);
  console.log(`Wormhole scan: https://wormholescan.io/#/tx/${res.transactions[0].txID()}`);
}
