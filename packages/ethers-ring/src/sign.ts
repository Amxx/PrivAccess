import { BigNumber            } from "@ethersproject/bignumber";
import { Bytes, arrayify      } from "@ethersproject/bytes";
import { hashMessage          } from "@ethersproject/hash";
import { keccak256            } from "@ethersproject/keccak256";
import { randomBytes          } from "@ethersproject/random";
import { RingSign, KeyPairish } from './types';
import * as utils               from './utils';

export function sign(message: Bytes | string, personal: KeyPairish, external: KeyPairish[]): RingSign {
    const digest = arrayify(hashMessage(message));

    // signer curve
    const signer = utils.keyFromPrivateOrSigner(personal);
    // ring curves (must include signer + uniqueness + shuffle)
    const ring = [].concat(
        signer,
        external.map(utils.keyFromPublicOrSigner)
    )
    .filter((key, i, array) => array.findIndex(k => k.getPublic("hex") === key.getPublic("hex")) == i)
    .sort(() => .5 - Math.random())

    if (ring.length < 2) {
        throw new Error("size less than two does not make sense");
    }

    const offset = ring.findIndex(k => k.priv);
    const image  = utils.getKeyImage(signer);
    const C      = new Array(ring.length).fill(null);
    const S      = new Array(ring.length).fill(null).map(() => BigNumber.from(randomBytes(32)));

    Array(ring.length)
    .fill(null)
    .forEach((_, step) => {
        const idx   = (offset + step) % ring.length;

        const c_i = step && C[idx].toHexString().replace(/^0x/, '');
        const s_i =         S[idx].toHexString().replace(/^0x/, '');

        const point = step ? {
            l: ring[idx].getPublic().mul(c_i).add(signer.ec.curve.g.mul(s_i)),
            r: image.mul(c_i).add(utils.hashPoint(ring[idx]).mul(s_i)),
        } : {
            l: signer.ec.g.mul(s_i),
            r: utils.hashPoint(signer).mul(s_i),
        };

        C[(idx + 1) % ring.length] = BigNumber.from(arrayify(keccak256([].concat(
            ...digest,
            point.l.x.toArray('big'),
            point.l.y.toArray('big'),
            point.r.x.toArray('big'),
            point.r.y.toArray('big'),
        ))));
    });

    let cs_mul_ks     = C[offset].mul(signer.getPrivate().toString());
    let u_sub_csmulks = cs_mul_ks.mul(-1).add(S[offset]);
    S[offset]         = u_sub_csmulks.mod(signer.ec.curve.n.toString());

    return {
        image,
        ring:   ring.map(x => '0x' + x.getPublic("hex")),
        value:  C[0],
        values: S,
    };
}