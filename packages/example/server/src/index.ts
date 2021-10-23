import express           from 'express';
import body_parser       from 'body-parser';
import debug             from 'debug';
import { ethers        } from 'ethers';
import { verify, utils } from '@privacess/lib';

const DEBUG = debug('privacess')

const app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

app.get('/', async function (req, res) {
    res.send('works');
});

function runCheck(address) {
    const contract = new ethers.Contract(
        process.env.ADDRESS,
        ['function balanceOf(address) public view returns(uint256)'],
        ethers.getDefaultProvider(process.env.RPC),
    );
    return contract.balanceOf(address).then(count => count.gt(0));
}

app.post('/secure', async function (req, res) {
    try {
        const message   = 'message';
        const sign      = utils.deserialize(req.body.sig);
        const addresses = sign.ring.map(keyish => utils.keyFromPublicOrSigner(keyish)).map(utils.getAddress);
        const valid     = await Promise.all(addresses.map(runCheck)).then(results => results.every(Boolean));

        if (!valid) {
            res.send({ error: 'invalid ring entries' });
            return;
        }

        if (!verify(message, sign)) {
            res.send({ error: 'invalid signature' });
            return;
        }

        res.send('some secret you only get if you are authenticated');

    } catch (error) {
        res.send({ error: error.toString() });
    }
});

app.listen(parseInt(process.env.PORT) || 3000);
DEBUG('ready');