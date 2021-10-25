import { arrayify, concat, hexlify, zeroPad } from "@ethersproject/bytes";
import { getCurve, keyFromPublicOrSigner    } from './curve';
import { RingSign                           } from './types';

export function serialize({ image, value, values, ring }: RingSign): string {
    const [ x , y ] = image.toJSON();

    return hexlify(concat([].concat(
        zeroPad('0x' + x.toString(16), 32),
        zeroPad('0x' + y.toString(16), 32),
        zeroPad(hexlify(value),        32),
        Array(ring.length).fill(null).flatMap((_, i) => [
            zeroPad(hexlify(values[i]), 32),
            zeroPad('0x' + keyFromPublicOrSigner(ring[i]).getPublic('hex'), 65),
        ]),
    )));
}

export function deserialize(str: string): RingSign {
    try {
        const buffer = arrayify(str);
        const size   = (buffer.length - 0x60) / 0x61;
        const x      = buffer.slice(0x00, 0x20);
        const y      = buffer.slice(0x20, 0x40);
        const value   = hexlify(buffer.slice(0x40, 0x60));
        const values  = Array(size).fill(null).map((_, i) => hexlify(buffer.slice(0x61 * i + 0x60, 0x61 * i + 0x80)));
        const ring    = Array(size).fill(null).map((_, i) => hexlify(buffer.slice(0x61 * i + 0x80, 0x61 * i + 0xC1)));
        const image   = getCurve().g.curve.point(x, y);
        return { image, value, values, ring };
    } catch(error) {
        throw new Error("invalid serialized signature: " + error);
    }
}