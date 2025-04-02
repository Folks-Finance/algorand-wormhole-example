# Algorand-Wormhole Example

## Overview

This repository demonstrates cross-chain messaging between Algorand and EVM blockchains using Wormhole as GMP. The core functionality is implemented as a simple ping/pong application where messages can be sent from one chain and received on another.

## Features

- Cross-chain message sending between Algorand and EVM chains
- Demonstration of Wormhole's messaging protocol
- Smart contracts implementation in both Algorand and Solidity
- Example scripts for deployment and interaction

## Architecture

The project consists of two main components:

1. **Algorand Implementation**:

   - Smart contracts written in Python Algorand
   - Message emitter and receiver contract
   - Helper scripts for deployment and interaction

2. **EVM Implementation**:
   - Smart contracts written in Solidity
   - Integration with Wormhole Solidity SDK
   - Helper scripts for deployment and interaction

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/algorand-wormhole-example.git
cd algorand-wormhole-example
```

### 2. Python environment setup

```bash
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

### 3. Node.js dependencies

```bash
pnpm install
```

### 4. EVM setup

Install Foundry if you haven't already:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install dependencies and build:

```bash
forge install --no-commit wormhole-foundation/wormhole-solidity-sdk
forge build
pnpm compile:evm
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Development only - NEVER use production mnemonics in code or version control
MAINNET_ACCOUNT="your_avm_mnemonic_here"
EMV_MNEMONIC="your_evm_mnemonic_here"
```

## How It Works

1. A message is sent from the source chain (Ping)
2. Wormhole guardians observe and sign the message
3. The signed message (VAA) is delivered to the target chain
4. The target chain contract verifies and processes the message (Pong)

## Useful APIs

Wormhole provides APIs to query message history:

```
https://api.wormholescan.io/api/v1/vaas/:chain_id/:emitter_addr
```

You can also view messages on the Wormhole Explorer:

```
https://wormholescan.io/#/tx/{transaction_id}
```

## Resources

- [Wormhole Documentation](https://docs.wormhole.com/)
- [Algorand Developer Documentation](https://developer.algorand.org/)
- [Wormhole Solidity SDK](https://github.com/wormhole-foundation/wormhole-solidity-sdk)
- [Wormhole Algorand Integration](https://github.com/wormhole-foundation/wormhole/tree/main/algorand)
