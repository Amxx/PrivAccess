import { keccak256           } from "@ethersproject/keccak256";
import { SigningKey          } from '@ethersproject/signing-key';
import { computeAddress      } from '@ethersproject/transactions';
import { Wallet              } from '@ethersproject/wallet';
import { ec                  } from 'elliptic';
import { KeyPair, KeyPairish } from './types';

let _curve: ec = null
export function getCurve(): ec {
    return _curve || (_curve = new ec("secp256k1"));
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

export function getAddress(key: KeyPair) :string {
    return computeAddress('0x' + key.getPublic('hex'));
}