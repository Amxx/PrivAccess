import * as secp                        from 'noble-secp256k1';
import { BytesLike, arrayify, hexlify } from '@ethersproject/bytes';

export function bigintToHex(i : bigint): Uint8Array {
    return arrayify(hexlify(i));
}

export function hexToBigint(i: BytesLike): bigint {
    return BigInt(hexlify(i))
};

export function random(length?: number): bigint {
    return hexToBigint(secp.utils.randomBytes(length ?? 32));
}