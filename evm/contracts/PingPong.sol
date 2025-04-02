// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@wormhole-solidity-sdk/interfaces/IWormhole.sol";
// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract PingPong {
    error InvalidVaa();
    error InvalidReceivedPayload(bytes message);

    event ReceivedMessage(
        bytes32 indexed hash,
        uint16 indexed emitterChainId,
        bytes32 indexed emitterAddress,
        uint64 sequence
    );
    IWormhole public wormhole;

    uint32 public nonce = 0;
    uint8 public CONSISTENCY_LEVEL = 200;

    constructor(address _wormhole) {
        wormhole = IWormhole(_wormhole);
    }

    function ping() external {
        _ping();
    }

    function receiveMessage(bytes memory encodedMessage) external {
        uint16 sourceChainId;
        bytes memory payload;

        (sourceChainId, payload) = _verifyMessage(encodedMessage);

        if (keccak256(payload) == keccak256(bytes("ping"))) {
            _pong();
        } else if (keccak256(payload) == keccak256(bytes("pong"))) {
            _ping();
        } else {
            revert InvalidReceivedPayload(payload);
        }
    }

    function _ping() internal {
        wormhole.publishMessage(nonce, "ping", CONSISTENCY_LEVEL);
    }

    function _pong() internal {
        wormhole.publishMessage(nonce, "pong", CONSISTENCY_LEVEL);
    }

    function _verifyMessage(
        bytes memory encodedMessage
    ) internal view returns (uint16, bytes memory) {
        (IWormhole.VM memory vm, bool valid, ) = wormhole.parseAndVerifyVM(
            encodedMessage
        );

        if (!valid) revert InvalidVaa();

        return (vm.emitterChainId, vm.payload);
    }
}
