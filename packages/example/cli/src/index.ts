import yargs           from 'yargs/yargs';
import { ethers      } from 'ethers';
import { sign, utils } from '@privacess/lib';

const revert = (msg = "error") => { throw new Error(msg); }

const argv = yargs(process.argv)
  .env('')
  .options({
    msg: {
        alias: 'message',
        type: 'string',
        default: 'hello world',
    },
    mn: {
        alias: 'mnemonic',
        type: 'string',
    },
    pk: {
        alias: 'privateKey',
        type: 'string',
    },
    pubs: {
        alias: 'publicKeys',
        type: 'array',
        default: [],
    }
  })
  .check(argv => !!(argv.pk || argv.mn || revert('One signer method is required.')))
  .argv;

console.log({
    msg: argv.msg,
    sig: utils.serialize(sign(
        argv.msg,
        argv.mn ? ethers.Wallet.fromMnemonic(argv.mn) : new ethers.Wallet(argv.pk),
        argv.pubs.flatMap(entry => entry.split(/[ ,;|]+/)).map(entry => String(entry)),
    ))
})