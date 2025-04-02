import { readFileSync } from "fs";

export const PING_PONG_APP_ID = 2883879379n;
export const WORMHOLE_CORE_APP_ID = 842125965n;
export const TEMPLATE_SIG_TEAL = readFileSync("avm/contracts/external/TmplSig.teal").toString();
