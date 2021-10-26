const secp                    = require('noble-secp256k1');
const { ethers              } = require('ethers');
const { assert              } = require('chai');
const { sign, verify, utils } = require('../dist');

const keys = [].concat(
    ethers.utils.hexlify(secp.utils.randomPrivateKey()),
    Array(31).fill()
        .map(secp.utils.randomPrivateKey)
        .map(pk => secp.getPublicKey(pk, false))
        .map(ethers.utils.hexlify),
);

describe ('verify signature', () => {
    beforeEach (async () => {
        this.sig = sign("hello world", keys);
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

    describe ('mass check', () => {
        for (const i in new Array(32).fill()) {
            it (`check #${i}`, async () => {
                assert.isTrue(verify("hello world", utils.deserialize(utils.serialize(this.sig))));
            });
        }
    });

});
