import { pingPongContract } from "./utils.ts";

export async function sendPing() {
  const txn = await pingPongContract.write.ping();
  console.log(`Ping sent at: ${txn}`);
}
