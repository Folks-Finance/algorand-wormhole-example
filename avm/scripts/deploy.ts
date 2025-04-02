import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { OnApplicationComplete, encodeAddress, getApplicationAddress } from "algosdk";

import { PingPongFactory } from "../specs/client/PingPong.client.ts";
import { WORMHOLE_CORE_APP_ID } from "./constants.ts";
import { getEmitterAddress, getWallet, provider } from "./utils.ts";

export async function deploy() {
  const account = await getWallet();
  const factory = provider.client.getTypedAppFactory(PingPongFactory, {
    defaultSender: account.addr,
    defaultSigner: account.signer,
  });

  // deploy app
  const { appClient } = await factory.deploy({
    createParams: {
      sender: account,
      method: "create",
      args: [WORMHOLE_CORE_APP_ID],
    },
  });
  console.log(`PingPong contract deployed!`);
  console.log(`AppId: ${appClient.appId}`);
  console.log(`Addr: ${appClient.appAddress}`);

  const emitterLogicSig = await getEmitterAddress();

  // opt in and rekey logic sig
  const SEED_AMT = new AlgoAmount({ microAlgos: 1002000 });
  await provider
    .newGroup()
    .addPayment({
      sender: account,
      receiver: emitterLogicSig,
      amount: SEED_AMT,
      staticFee: new AlgoAmount({ microAlgos: 2000 }),
    })
    .addAppCall({
      sender: emitterLogicSig,
      appId: WORMHOLE_CORE_APP_ID,
      onComplete: OnApplicationComplete.OptInOC,
      rekeyTo: getApplicationAddress(WORMHOLE_CORE_APP_ID),
      staticFee: new AlgoAmount({ microAlgos: 0 }),
    })
    .send();

  // set emitter lsig
  await appClient.send.setEmitterLsig({
    args: [encodeAddress(emitterLogicSig.publicKey)],
    staticFee: new AlgoAmount({ microAlgos: 1000 }),
  });

  console.log(`Emitter LogicSig set!`);
  console.log(`Addr: ${encodeAddress(emitterLogicSig.publicKey)}`);
}
