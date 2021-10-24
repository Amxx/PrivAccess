import { arrayify, hexlify, concat } from "@ethersproject/bytes";
import { keccak256                 } from "@ethersproject/keccak256";
import { SigningKey                } from '@ethersproject/signing-key';
import { computeAddress            } from '@ethersproject/transactions';
import { Wallet                    } from '@ethersproject/wallet';
import { ec                        } from 'elliptic';
import { KeyPair, KeyPairish       } from './types';

let _curve: ec = null

export function getCurve() {
    if (!_curve) {
        _curve = new ec("secp256k1");
    }
    return _curve;
}

export function keyFromPublicOrSigner(input: KeyPairish): KeyPair {
    if (typeof input === 'string') {
        return getCurve().keyFromPublic(input.replace(/^0x/, ""), "hex");
    } else if (input instanceof SigningKey) {
        return keyFromPublicOrSigner(input.publicKey);
    } else if (input instanceof Wallet) {
        return keyFromPublicOrSigner(input._signingKey());
    } else if (input instanceof ec.KeyPair) {
        return input
    } else {
        throw new Error("Error: invalid input for getPublic");
    }
}

export function keyFromPrivateOrSigner(input: KeyPairish): KeyPair {
    if (typeof input === 'string') {
        return getCurve().keyFromPrivate(input.replace(/^0x/, ""), "hex");
    } else if (input instanceof SigningKey) {
        return keyFromPrivateOrSigner(input.privateKey);
    } else if (input instanceof Wallet) {
        return keyFromPrivateOrSigner(input._signingKey());
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

export function serialize({ image, value, values, ring }) {
    const [ x , y ] = image.toJSON();

    return hexlify(concat([].concat(
        arrayify('0x' + x.toString(16)),
        arrayify('0x' + y.toString(16)),
        arrayify(value),
        Array(ring.length).fill(null).flatMap((_, i) => [
            arrayify(values[i]),
            arrayify('0x' + keyFromPublicOrSigner(ring[i]).getPublic('hex')),
        ]),
    )));
}

export function deserialize(data) {
    try {
        const buffer = arrayify(data);
        const size   = (buffer.length - 0x60) / 0x61;
        const x      = buffer.slice(0x00, 0x20);
        const y      = buffer.slice(0x20, 0x40);
        const value  = hexlify(buffer.slice(0x40, 0x60));
        const values = Array(size).fill(null).map((_, i) => hexlify(buffer.slice(0x61 * i + 0x60, 0x61 * i + 0x80)));
        const ring   = Array(size).fill(null).map((_, i) => hexlify(buffer.slice(0x61 * i + 0x80, 0x61 * i + 0xC1)));
        const image  = getCurve().g.curve.point(x, y);

        return { image, value, values, ring };
    } catch {
        throw new Error("invalid serialized signature");
    }
}

export function getAddress(key: KeyPair) {
    return computeAddress('0x' + key.getPublic('hex'));
}