import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { UniversalAddress } from "@wormhole-foundation/sdk";
import { getApplicationAddress } from "algosdk";
import { readFileSync } from "fs";

import { PingPongFactory } from "../specs/client/PingPong.client.ts";
import { PING_PONG_APP_ID, TEMPLATE_SIG_TEAL, WORMHOLE_CORE_APP_ID } from "./constants.ts";

export async function getLocalStateAsBytes(
  algorand: AlgorandClient,
  appId: bigint,
  address: string,
): Promise<Uint8Array> {
  const ai = await algorand.client.algod.accountApplicationInformation(address, appId).do();
  if (!ai.appLocalState) throw Error("cannot find local state");

  let ret = Buffer.alloc(0);
  let empty = Buffer.alloc(0);

  const e = Buffer.alloc(127);
  const m = Buffer.from("meta");

  let sk: string[] = [];
  let vals: Map<string, Buffer> = new Map<string, Buffer>();
  for (const kv of ai.appLocalState.keyValue || []) {
    const k = Buffer.from(kv.key);
    const key: number = k.readInt8();
    if (!Buffer.compare(k, m)) {
      continue;
    }
    const v: Buffer = Buffer.from(kv.value.bytes);
    if (Buffer.compare(v, e)) {
      vals.set(key.toString(), v);
      sk.push(key.toString());
    }
  }
  sk.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  sk.forEach((v) => {
    ret = Buffer.concat([ret, vals.get(v) || empty]);
  });
  return new Uint8Array(ret);
}

export const provider = AlgorandClient.mainNet();
export const getWallet = async (name = "MAINNET_ACCOUNT") => await provider.account.fromEnvironment(name);

const factory = provider.client.getTypedAppFactory(PingPongFactory);
export const pingPongContract = factory.getAppClientById({ appId: PING_PONG_APP_ID });
export const emitter = new UniversalAddress(Buffer.from(pingPongContract.appAddress.publicKey).toString("hex"));

export const getEmitterAddress = async () => {
  const EMITTER_ADDRESS = getApplicationAddress(pingPongContract.appId).publicKey;
  const WORMHOLE_CORE_APP_ADDRESS = getApplicationAddress(WORMHOLE_CORE_APP_ID).publicKey;
  const { compiledBase64ToBytes: compiledEmitterLogicSig } = await provider.app.compileTealTemplate(TEMPLATE_SIG_TEAL, {
    ADDR_IDX: 0,
    EMITTER_ID: EMITTER_ADDRESS,
    APP_ID: WORMHOLE_CORE_APP_ID,
    APP_ADDRESS: WORMHOLE_CORE_APP_ADDRESS,
  });
  return provider.account.logicsig(compiledEmitterLogicSig);
};
export const getGuardianAddress = async () => {
  const GUARDIAN = new TextEncoder().encode("guardian");
  const WORMHOLE_CORE_APP_ADDRESS = getApplicationAddress(WORMHOLE_CORE_APP_ID).publicKey;
  const { compiledBase64ToBytes: compiledGuardianLogicSig } = await provider.app.compileTealTemplate(
    readFileSync("avm/contracts/external/TmplSig.teal").toString(),
    {
      ADDR_IDX: 4,
      EMITTER_ID: GUARDIAN,
      APP_ID: WORMHOLE_CORE_APP_ID,
      APP_ADDRESS: WORMHOLE_CORE_APP_ADDRESS,
    },
  );
  return provider.account.logicsig(compiledGuardianLogicSig);
};
export const getVerifierSigsLogicSig = async () => {
  const { compiledBase64ToBytes: compiledVerifySigsLogicSig } = await provider.app.compileTeal(
    readFileSync("avm/contracts/external/VerifySigs.teal").toString(),
  );
  return provider.account.logicsig(compiledVerifySigsLogicSig);
};
