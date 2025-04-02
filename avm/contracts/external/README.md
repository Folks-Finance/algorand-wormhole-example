# External

This folder contains external smart contracts which the protocol interacts with

## Wormhole TmplSig

When publishing a message, should be opted into and rekeyed to WormholeCore

- TMPL_ADDR_IDX = 0
- TMPL_EMITTER_ID = TransceiverAddress byte[32]

When verifying message in `WormholeCore.verifyVAA` call, should be opted into and rekeyed to WormholeCore

- TMPL_ADDR_IDX = `WormholeCore.currentGuardianSetIndex`
- TPL_EMITTER_ID = "guardian" utf8 string stored in hex

**OUTDATED** when checking for duplicate received messages, should be opted into and rekeyed to handler e.g. TokenBridge

- TMPL_ADDR_IDX = `int(vaa.sequence / MAX_BITS)`
- TMPL_EMITTER_ID = "guardian" utf8 string stored in hex
