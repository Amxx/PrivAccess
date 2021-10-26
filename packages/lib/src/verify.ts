import * as secp                            from 'noble-secp256k1';
import { zip                              } from 'zip-array';
import { Bytes, arrayify, concat, hexlify } from '@ethersproject/bytes';
import { hashMessage                      } from '@ethersproject/hash';
import { keccak256                        } from '@ethersproject/keccak256';
import { Key                              } from './utils';
import { RingSig                          } from './sign';

export function verify(
    message: Bytes | string,
    sig: RingSig,
): boolean {
    const digest = arrayify(hashMessage(message));
    return sig.value == zip(
        sig.ring.map(Key.from),
        sig.seeds,
    ).reduce((c: bigint, [ k, s ] : [ Key, bigint ]) => {
        return BigInt(hexlify(keccak256(concat([].concat(
            digest,
            [
                k.point.multiply(c).add(secp.Point.BASE.multiply(s)),
                k.hashPoint.multiply(s).add(sig.image.multiply(c)),
            ]
            .flatMap((pt) => [ pt.x, pt.y ])
            .map((i) => arrayify(hexlify(i))),
        )))));
    }, sig.value);



    // return sig.ring.map(utils.keyFromPublicOrSigner).reduce((C_i : BigNumber, key: KeyPair, i : number) => {
    //     const c_i = utils.toBN(C_i);
    //     const s_i = utils.toBN(sig.values[i]);

    //     const point = {
    //         l: key.ec.curve.g.mul(s_i).add(key.getPublic().mul(c_i)),
    //         r: utils.hashPoint(key).mul(s_i).add(sig.image.mul(c_i)),
    //     };

    //     return BigNumber.from(keccak256([].concat(
    //         ...digest,
    //         point.l.x.toArray('big'),
    //         point.l.y.toArray('big'),
    //         point.r.x.toArray('big'),
    //         point.r.y.toArray('big'),
    //     )));
    // }, C0).eq(C0);
}
