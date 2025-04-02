import { AVM } from "../avm/index.ts";
import { EVM } from "../evm/index.ts";

async function main() {
  // Deploy the contracts
  //   await AVM.deploy();
  //   await EVM.deploy();
  //   // Send a ping message from Algorand to EVM
  //   await AVM.sendPing();
  //   // Send a pong message from EVM to Algorand
  //   const sequence = 3n;
  //   await EVM.sendPong("Algorand", AVM.emitter, sequence);
  //   // Send a ping message from EVM to Algorand
  //   await EVM.sendPing();
  //   // Send a pong message from Algorand to EVM
  //   await AVM.sendPong("Base", EVM.emitter, sequence);
}

main().catch(console.error);
