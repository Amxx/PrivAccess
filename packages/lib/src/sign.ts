import * as secp                            from 'noble-secp256k1';
import { Bytes, arrayify, concat, hexlify } from '@ethersproject/bytes';
import { hashMessage                      } from '@ethersproject/hash';
import { keccak256                        } from '@ethersproject/keccak256';
import { shuffled                         } from '@ethersproject/random';
import { Key, Keyish                      } from './utils';

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
    const S:      bigint[]   = new Array(ring.length).fill(null).map(() => BigInt(hexlify(secp.utils.randomBytes(32))));
    const C:      bigint[]   = new Array(ring.length).fill(null);

    ring.forEach((_, step) => {
        const i = (offset + step) % ring.length;
        C[(i + 1) % ring.length] = BigInt(hexlify(keccak256(concat([].concat(
            digest,
            (
                (step == 0)
                ?
                    [
                        secp.Point.BASE.multiply(S[i]),
                        ring[i].hashPoint.multiply(S[i]),
                    ]
                :
                    [
                        ring[i].point.multiply(C[i]).add(secp.Point.BASE.multiply(S[i])),
                        ring[i].hashPoint.multiply(S[i]).add(image.multiply(C[i])),
                    ]
            )
            .flatMap((pt: secp.Point) => [ pt.x, pt.y ])
            .map((i: bigint) => arrayify(hexlify(i))),
        )))));
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

// export function sign(message: Bytes | string, personal: KeyPairish, external: KeyPairish[]): RingSign {
//     const digest = arrayify(hashMessage(message));

//     // signer curve
//     const signer = utils.keyFromPrivateOrSigner(personal);

//     // ring curves (must include signer + uniqueness + shuffle)
//     const ring = shuffled([].concat(
//         signer,
//         external.map(utils.keyFromPublicOrSigner)
//     ).filter((key, i, array) => array.findIndex(k => k.getPublic('hex') === key.getPublic('hex')) == i))

//     if (ring.length < 2) {
//         throw new Error('size less than two does not make sense');
//     }

//     const offset = ring.findIndex(k => k.priv);
//     const image  = utils.getKeyImage(signer);
//     const C      = new Array(ring.length).fill(null);
//     const S      = new Array(ring.length).fill(null).map(() => BigNumber.from(randomBytes(32)));

//     Array(ring.length)
//     .fill(null)
//     .forEach((_, step) => {
//         const idx   = (offset + step) % ring.length;

//         const c_i = step && C[idx].toHexString().replace(/0x/, '');
//         const s_i =         S[idx].toHexString().replace(/0x/, '');

//         const point = step ? {
//             l: ring[idx].getPublic().mul(c_i).add(signer.ec.g.mul(s_i)),
//             r: utils.hashPoint(ring[idx]).mul(s_i).add(image.mul(c_i)),
//         } : {
//             l: signer.ec.g.mul(s_i),
//             r: utils.hashPoint(signer).mul(s_i),
//         };

//         C[(idx + 1) % ring.length] = BigNumber.from(keccak256([].concat(
//             ...digest,
//             point.l.x.toArray('big'),
//             point.l.y.toArray('big'),
//             point.r.x.toArray('big'),
//             point.r.y.toArray('big'),
//         )));
//     });

//     let cs_mul_ks     = C[offset].mul(signer.getPrivate().toString());
//     let u_sub_csmulks = cs_mul_ks.mul(-1).add(S[offset]);
//     S[offset]         = u_sub_csmulks.mod(signer.ec.n.toString());

//     return {
//         image,
//         ring:   ring.map(x => '0x' + x.getPublic('hex')),
//         value:  C[0],
//         values: S,
//     };
// }