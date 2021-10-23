const { assert } = require('chai')
const { sign, verify, utils } = require('../dist');

const personal = "0x358be44145ad16a1add8622786bef07e0b00391e072855a5667eb3c78b9d3803";
const pubs     = [
    "0x045655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068a",
    "0x046655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068b",
    "0x047655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068c",
    "0x048655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068d",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068e",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0680",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0681",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0682",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0683",
];

describe ('verify signature', () => {
    beforeEach (async () => {
        this.sig = sign("hello world", personal, pubs);
    });

    it ('accept valid signature', async () => {
        assert.isTrue(verify("hello world", this.sig));
    });

    it ('reject valid signature', async () => {
        assert.isFalse(verify("not hello world", this.sig));
    });

    describe ('serialize/decerialize', () => {
        beforeEach (async () => {
            this.serialized   = utils.serialize(this.sig);
            this.deserialized = utils.deserialize(this.serialized);
        });

        it ('accept valid signature', async () => {
            assert.isTrue(verify("hello world", this.deserialized));
        });

        it ('reject valid signature', async () => {
            assert.isFalse(verify("not hello world", this.deserialized));
        });
    });
})

// const addresses = deserialized.ring
//     .map(keyish => utils.keyFromPublicOrSigner(keyish))
//     .map(utils.getAddress);

// console.log(addresses)
