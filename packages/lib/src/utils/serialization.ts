import * as secp                              from 'noble-secp256k1';
import { zip                                } from 'zip-array';
import { arrayify, concat, hexlify, zeroPad } from '@ethersproject/bytes';
import { RingSig                            } from '../sign';
import { Key                                } from './key';

export function serialize({ image, value, ring, seeds }: RingSig): string {
    return hexlify(concat([].concat(
        zeroPad(image.toRawBytes(), 65),
        zeroPad(hexlify(value),     32),
        zip(
            ring.map(k => zeroPad(Key.from(k).public, 65)),
            seeds.map(s => zeroPad(hexlify(s), 32)),
        ).flatMap(x => x),
    )));
}

export function deserialize(str: string): RingSig {
    try {
        const buffer = arrayify(str);
        const [ header, ...blocks ] = Array(buffer.length / 0x61)
        .fill(null)
        .map((_, i) => ({
            x: hexlify(buffer.slice(0x00 + i * 0x61, 0x41 + i * 0x61)),
            y: BigInt(hexlify(buffer.slice(0x41 + i * 0x61, 0x61 + i * 0x61))),
        }));

        return {
            image: secp.Point.fromHex(header.x.replace(/^0x/, '')),
            value: header.y,
            ring:  blocks.map(({ x }) => x),
            seeds: blocks.map(({ y }) => y),
        };
    } catch(error) {
        throw new Error('invalid serialized signature: ' + error);
    }
}