export const PING_PONG_ADDRESS = "0xb6a59b28cfd9dd0e1668d512c54a11a175117d7c";
export const PING_PONG_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_wormhole",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
    ],
    name: "InvalidReceivedPayload",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidVaa",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint16",
        name: "emitterChainId",
        type: "uint16",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "emitterAddress",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "sequence",
        type: "uint64",
      },
    ],
    name: "ReceivedMessage",
    type: "event",
  },
  {
    inputs: [],
    name: "nonce",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ping",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pong",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "encodedMessage",
        type: "bytes",
      },
    ],
    name: "receiveMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "wormhole",
    outputs: [
      {
        internalType: "contract IWormhole",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
export const PING_PONG_ARTIFACT = (await import("../artifacts/evm/contracts/PingPong.sol/PingPong.json")).default;
export const WORMHOLE_CORE_ADDRESS = "0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6";
