import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { type Chain, UniversalAddress, type WormholeMessageId, keccak256, wormhole } from "@wormhole-foundation/sdk";
import { OnApplicationComplete, bigIntToBytes, encodeAddress } from "algosdk";

import { WORMHOLE_CORE_APP_ID } from "./constants.ts";
import {
  getEmitterAddress,
  getGuardianAddress,
  getLocalStateAsBytes,
  getVerifierSigsLogicSig,
  getWallet,
  pingPongContract,
  provider,
} from "./utils.ts";

export async function sendPong(chain: Chain, emitter: UniversalAddress, sequence = 0n) {
  const account = await getWallet();

  const emitterLogicSig = await getEmitterAddress();
  const guardianLogicSig = await getGuardianAddress();
  const verifierSigsLogicSig = await getVerifierSigsLogicSig();

  // prepare transaction arguments TODO
  const wh = await wormhole("Mainnet", []);
  const messageId: WormholeMessageId = {
    chain,
    emitter,
    sequence,
  };

  const vaa = await wh.getVaa(messageId, "Uint8Array");
  const vaaBytes = await wh.getVaaBytes(messageId);
  if (vaa === null || vaaBytes === null) throw Error(`Couldn't find vaa for message id ${messageId}`);

  const GUARDIAN_KEY_LENGTH: number = 20;
  const guardianLocalState = await getLocalStateAsBytes(
    provider,
    WORMHOLE_CORE_APP_ID,
    encodeAddress(guardianLogicSig.publicKey),
  );
  const guardianSignatures = Uint8Array.from(
    vaa.signatures.flatMap(({ guardianIndex, signature }) => [
      ...bigIntToBytes(Number(guardianIndex), 1),
      ...signature.encode(),
    ]),
  );
  const guardianKeys = Uint8Array.from(
    vaa.signatures.flatMap(({ guardianIndex }) => [
      ...guardianLocalState.slice(
        guardianIndex * GUARDIAN_KEY_LENGTH + 1,
        (guardianIndex + 1) * GUARDIAN_KEY_LENGTH + 1,
      ),
    ]),
  );
  const digestHash = keccak256(keccak256(vaaBytes.slice(6 + guardianSignatures.length)));

  // transaction group - passing in dummy account instead of sequenceLogicSig as it's never actually used
  // 0. Verify signatures
  //  - sender VerifySigs (logic sig)
  //  - app WormholeCore
  //  - app args ["verifySigs", guardian_signatures, guardian_keys, digest_hash]
  //  - foreign accounts [X_DUMMY_ACCOUNT, guardianLogicSig]
  // 1. Verify VAA
  //  - sender user
  //  - app WormholeCore
  //  - app wormhole core
  //  - app args ["verifyVAA", vaa]
  //  - foreign accounts [X_DUMMY_ACCOUNT guardianLogicSig]
  // 2. Receive message
  //  - sender user
  //  - app PingPong
  const verifySigsTxn = await provider.createTransaction.appCall({
    sender: verifierSigsLogicSig,
    appId: WORMHOLE_CORE_APP_ID,
    onComplete: OnApplicationComplete.NoOpOC,
    args: [new TextEncoder().encode("verifySigs"), guardianSignatures, guardianKeys, digestHash],
    accountReferences: [account.addr, guardianLogicSig],
    staticFee: new AlgoAmount({ microAlgos: 0 }),
  });
  const verifyVAATxn = await provider.createTransaction.appCall({
    sender: account,
    appId: WORMHOLE_CORE_APP_ID,
    onComplete: OnApplicationComplete.NoOpOC,
    args: [new TextEncoder().encode("verifyVAA"), vaaBytes],
    accountReferences: [account.addr, guardianLogicSig],
    staticFee: new AlgoAmount({ microAlgos: 0 }),
  });

  // need to include verifySigs appl call which is not part of abi spec as WormholeCore is not compliant
  const res = await pingPongContract
    .newGroup()
    .addTransaction(verifySigsTxn, verifierSigsLogicSig.signer)
    .receiveMessage({
      sender: account,
      args: [verifyVAATxn],
      accountReferences: [emitterLogicSig],
      appReferences: [WORMHOLE_CORE_APP_ID],
      staticFee: new AlgoAmount({ microAlgos: 6000 }),
    })
    .send();

  console.log(`Wormhole scan: https://wormholescan.io/#/tx/${res.transactions[2].txID()}`);
}
