import * as secp from 'noble-secp256k1';

import {
    BytesLike,
    Hexable,
    arrayify,
    concat,
    hexlify,
    isBytesLike,
    zeroPad,
} from '@ethersproject/bytes';

import {
    keccak256,
} from '@ethersproject/keccak256';

import {
    defineReadOnly,
} from '@ethersproject/properties';

import {
    computeAddress,
} from '@ethersproject/transactions';

import {
    Wallet,
} from '@ethersproject/wallet';


function isHexable(value: any): value is Hexable {
    return !!(value.toHexString);
}


export type Keyish = Wallet | Key | BytesLike | Hexable | number | bigint;
export class Key {
    readonly private: string;
    readonly public:  string;

    constructor(keyish: Keyish) {
        if (
               typeof keyish === 'string'
            || typeof keyish ==  'number'
            || typeof keyish ==  'bigint'
            || isHexable(keyish)
            || isBytesLike(keyish)
        ) {
            switch (hexlify(keyish, { allowMissingPrefix: true }).length) {
                case 66:
                    defineReadOnly(this, 'private', hexlify(keyish, { allowMissingPrefix: true }));
                    defineReadOnly(this, 'public',  hexlify(secp.getPublicKey(arrayify(this.private))));
                    break;
                case 132:
                    defineReadOnly(this, 'private', undefined);
                    defineReadOnly(this, 'public',  hexlify(keyish, { allowMissingPrefix: true }));
                    break;
                default:
                    throw new Error(`Unsuported key ${keyish}`);
            }
        } else if (keyish instanceof Wallet) {
            defineReadOnly(this, 'private', keyish.privateKey);
            defineReadOnly(this, 'public',  keyish.publicKey);
        } else {
            defineReadOnly(this, 'private', keyish.private ? hexlify(keyish.private, { allowMissingPrefix: true }) : undefined);
            defineReadOnly(this, 'public',  keyish.public  ? hexlify(keyish.public,  { allowMissingPrefix: true }) : hexlify(secp.getPublicKey(arrayify(this.private))));
        }
    }

    get address(): string { return computeAddress(this.public)      };

    get point(): secp.Point {
        return secp.Point.fromHex(this.public.replace(/^0x/, ''));
    }

    get hashPoint(): secp.Point {
        return secp.Point.BASE.multiply(BigInt(hexlify(keccak256(concat([
            zeroPad(hexlify(this.point.x), 32),
            zeroPad(hexlify(this.point.y), 32),
        ])))));
    }

    get image(): secp.Point {
        return this.hashPoint.multiply(BigInt(this.private));
    }

    static from(keyish: Keyish): Key {
        return new Key(keyish);
    }
}