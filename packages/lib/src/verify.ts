import * as secp                  from 'noble-secp256k1';
import { zip                      } from 'zip-array';
import { Bytes, arrayify, concat, } from '@ethersproject/bytes';
import { hashMessage              } from '@ethersproject/hash';
import { keccak256                } from '@ethersproject/keccak256';
import { Key, hexToBigint         } from './utils';
import { RingSig                  } from './sign';

export function verify(
    message: Bytes | string,
    sig: RingSig,
): boolean {
    const digest = arrayify(hashMessage(message));
    return sig.value == zip(
        sig.ring.map(Key.from),
        sig.seeds,
    ).reduce((c: bigint, [ k, s ] : [ Key, bigint ]) => hexToBigint(keccak256(concat([].concat(
        digest,
        [
            k.point.multiply(c).add(secp.Point.BASE.multiply(s)),
            k.hashPoint.multiply(s).add(sig.image.multiply(c)),
        ].map(x => x.toRawBytes().slice(1)),
    )))), sig.value);
}
