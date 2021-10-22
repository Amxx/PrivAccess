import { BigNumberish } from '@ethersproject/bignumber';
import { SigningKey   } from '@ethersproject/signing-key';
import { Wallet       } from '@ethersproject/wallet';
import { ec           } from 'elliptic';

export type KeyPair    = ec.KeyPair;
export type KeyPairish = KeyPair | Wallet | SigningKey | string
export type Point      = ec.Point;
export type RingSign   = {
    ring:   KeyPairish[],
    image:  ec.Point,
    value:  BigNumberish,
    values: BigNumberish[],
}