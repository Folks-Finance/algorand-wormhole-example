from algopy import (
    Account,
    ARC4Contract,
    Bytes,
    GlobalState,
    OnCompleteAction,
    UInt64,
    itxn,
    gtxn,
    log,
    op,
    subroutine,
)
from algopy.arc4 import Address, abimethod


class PingPong(ARC4Contract):
    def __init__(self) -> None:
        self.wormhole_core = GlobalState(UInt64)
        self.emitter_lsig = GlobalState(Address)

    @abimethod(create="require")
    def create(self, wormhole_core: UInt64) -> None:
        self.wormhole_core.value = wormhole_core

    @abimethod
    def set_emitter_lsig(self, emitter_lsig: Address) -> None:
        self.emitter_lsig.value = emitter_lsig

    @abimethod
    def ping(self) -> None:
        self.send_message(Bytes(b"ping"))

    @abimethod
    def receive_message(self, verify_vaa: gtxn.ApplicationCallTransaction) -> None:
        assert verify_vaa.app_id.id == self.wormhole_core.value, "Unknown wormhole core"
        assert (
            verify_vaa.on_completion == OnCompleteAction.NoOp
        ), "Incorrect app on completion"
        assert verify_vaa.app_args(0) == Bytes(b"verifyVAA"), "Incorrect method"

        # header
        index = UInt64(5)  # skip version and guardian_set_index
        num_sigs = op.btoi(op.extract(verify_vaa.app_args(1), 5, 1))
        index += 1 + num_sigs * 66  # skip signatures

        # body
        digest = op.keccak256(
            op.keccak256(
                op.substring(
                    verify_vaa.app_args(1), index, verify_vaa.app_args(1).length
                )
            )
        )
        index += 8  # skip timestamp and nonce
        emitter_chain = op.extract_uint16(verify_vaa.app_args(1), index)
        index += 2
        emitter_address = op.extract(verify_vaa.app_args(1), index, 32)
        index += 41  # skip sequence and consistency_level
        payload = op.substring(
            verify_vaa.app_args(1), index, verify_vaa.app_args(1).length
        )

        # log the unique message hash and where message came from
        log(digest)
        log(emitter_chain)
        log(emitter_address)

        # respond with ping/pong
        match payload:
            case Bytes(b"ping"):
                self.send_message(Bytes(b"pong"))
            case Bytes(b"pong"):
                self.send_message(Bytes(b"ping"))
            case _:
                assert False, "Unknown payload"

    @subroutine
    def send_message(self, payload: Bytes) -> None:
        wormhole_core_address, exists = op.AppParamsGet.app_address(
            self.wormhole_core.value
        )
        assert exists, "Wormhole core address unknown"

        message_fee, exists = op.AppGlobal.get_ex_uint64(
            self.wormhole_core.value, Bytes(b"MessageFee")
        )
        assert exists, "Wormhole message fee is unknown"

        # call publish message
        payment = itxn.Payment(
            receiver=wormhole_core_address,
            amount=message_fee,
            fee=0,
        )
        app_call = itxn.ApplicationCall(
            app_id=self.wormhole_core.value,
            app_args=(Bytes(b"publishMessage"), payload, UInt64(0)),
            accounts=(Account(self.emitter_lsig.value.bytes),),
            fee=0,
        )
        itxn.submit_txns(payment, app_call)

        # log ping/pong
        log(payload)
