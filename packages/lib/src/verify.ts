import { BigNumber         } from "@ethersproject/bignumber";
import { Bytes, arrayify   } from "@ethersproject/bytes";
import { hashMessage       } from "@ethersproject/hash";
import { keccak256         } from "@ethersproject/keccak256";
import { KeyPair, RingSign } from './utils/types';
import * as utils            from './utils';

export function verify(
    message: Bytes | string,
    sig: RingSign,
): boolean {
    const digest = arrayify(hashMessage(message));
    const C0     = BigNumber.from(sig.value);

    return sig.ring.map(utils.keyFromPublicOrSigner).reduce((C_i : BigNumber, key: KeyPair, i : number) => {
        const c_i = utils.toBN(C_i);
        const s_i = utils.toBN(sig.values[i]);

        const point = {
            l: key.ec.curve.g.mul(s_i).add(key.getPublic().mul(c_i)),
            r: utils.hashPoint(key).mul(s_i).add(sig.image.mul(c_i)),
        };

        return BigNumber.from(keccak256([].concat(
            ...digest,
            point.l.x.toArray('big'),
            point.l.y.toArray('big'),
            point.r.x.toArray('big'),
            point.r.y.toArray('big'),
        )));
    }, C0).eq(C0);
}
