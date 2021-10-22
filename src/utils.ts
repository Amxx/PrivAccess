import { BigNumber           } from "@ethersproject/bignumber";
import { keccak256           } from "@ethersproject/keccak256";
import { SigningKey          } from '@ethersproject/signing-key';
import { Wallet              } from '@ethersproject/wallet';
import { ec                  } from 'elliptic';
import { KeyPair, KeyPairish } from './types';

let _curve: ec = null

function getCurve() {
    if (!_curve) {
        _curve = new ec("secp256k1");
    }
    return _curve;
}

export function toPublic(input: KeyPairish): KeyPair {
    if (typeof input === 'string') {
        return getCurve().keyFromPublic(input.replace(/^0x/, ""), "hex");
    } else if (input instanceof Wallet) {
        return input._signingKey().curve;
    } else if (input instanceof SigningKey) {
        return input.curve;
    } else if (input instanceof ec.KeyPair) {
        return input
    } else {
        throw new Error("Error: invalid input for getPublic");
    }
}

export function toPrivate(input: KeyPairish): KeyPair {
    if (typeof input === 'string') {
        return getCurve().keyFromPrivate(input.replace(/^0x/, ""), "hex");
    } else if (input instanceof Wallet) {
        return input._signingKey().curve;
    } else if (input instanceof SigningKey) {
        return input.curve;
    } else if (input instanceof ec.KeyPair) {
        return input
    } else {
        throw new Error("Error: invalid input for getPrivate");
    }
}

export function hashPoint(keyPair: KeyPair) {
    return keyPair.ec.g.mul(keccak256([].concat(
        keyPair.getPublic().getX().toArray('big'),
        keyPair.getPublic().getY().toArray('big'),
    )));
}

export function getKeyImage(keyPair: KeyPair) {
    let hash = hashPoint(keyPair);
    let privKey = keyPair.getPrivate();
    let privKey_arr = privKey.toArray("be");
    let keyImage = hash.mul(privKey_arr);
    return keyImage;
}

export function serialize(sign) {
    return JSON.stringify({
        ring:   sign.ring.map(key => typeof key === 'string' ? key : toPublic(key).getPublic('hex')),
        image:  sign.image.toJSON(),
        value:  BigNumber.from(sign.value).toHexString(),
        values: sign.values.map(bn => BigNumber.from(bn).toHexString()),
    })
}

export function deserialize(data) {
    const sign = JSON.parse(data);
    sign.image = getCurve().g.curve.point(...sign.image);
    return sign;
}