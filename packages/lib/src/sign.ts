import * as secp                            from 'noble-secp256k1';
import { Bytes, arrayify, concat          } from '@ethersproject/bytes';
import { hashMessage                      } from '@ethersproject/hash';
import { keccak256                        } from '@ethersproject/keccak256';
import { shuffled                         } from '@ethersproject/random';
import { Key, Keyish, hexToBigint, random } from './utils';

export type RingSig = {
    image: secp.Point,
    ring:  Keyish[]
    value: bigint,
    seeds: bigint[],
}

export function sign(message: Bytes | string, keys: Keyish[]): RingSig {
    const digest: Uint8Array = arrayify(hashMessage(message));
    const ring:   Key[]      = shuffled(keys.map(Key.from).filter((key, i, array) => array.findIndex((k) => k.public == key.public) == i));
    const offset: number     = ring.findIndex(k => k.private);
    const image:  secp.Point = ring[offset].image;
    const S:      bigint[]   = new Array(ring.length).fill(null).map(random);
    const C:      bigint[]   = new Array(ring.length).fill(null);

    ring.forEach((_, step) => {
        const i   = (offset + step) % ring.length;
        const pts = (step == 0) ? [
            secp.Point.BASE.multiply(S[i]),
            ring[i].hashPoint.multiply(S[i])
        ] : [
            ring[i].point.multiply(C[i]).add(secp.Point.BASE.multiply(S[i])),
            ring[i].hashPoint.multiply(S[i]).add(image.multiply(C[i]))
        ];

        C[(i + 1) % ring.length] = hexToBigint(keccak256(concat([].concat(
            digest,
            pts.map(x => x.toRawBytes().slice(1))
        ))));
    })

    S[offset] -= C[offset] * BigInt(ring[offset].private);
    S[offset] %= secp.CURVE.n;
    S[offset] += secp.CURVE.n;
    S[offset] %= secp.CURVE.n;

    return {
        image,
        ring:  ring.map(k => k.public),
        value: C[0],
        seeds: S,
    };
}
