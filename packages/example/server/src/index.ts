import express           from 'express';
import cors              from 'cors';
import body_parser       from 'body-parser';
import debug             from 'debug';
import { ethers        } from 'ethers';
import { verify, utils } from '@privaccess/lib';

const DEBUG = debug('privaccess')

const app = express();
app.use(cors({ origin: '*' }));
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
    return contract.balanceOf(address).then(count => count.gt(0)).then(result => {
        DEBUG("address", address, result);
        return result;
    });
}

app.post('/secure', async function (req, res) {
    try {
        const message   = 'connect';
        const sign      = utils.deserialize(req.body.sig);
        const addresses = sign.ring.map(keyish => utils.keyFromPublicOrSigner(keyish)).map(utils.getAddress);
        const valid     = await Promise.all(addresses.map(runCheck)).then(results => results.every(Boolean));

        if (!valid) {
            DEBUG({ error: 'connection refused', details: 'invalid ring entries' });
            res.send({ error: 'connection refused', details: 'invalid ring entries' });
            return;
        }

        if (!verify(message, sign)) {
            DEBUG({ error: 'connection refused', details: 'invalid signature' });
            res.send({ error: 'connection refused', details: 'invalid signature' });
            return;
        }

        DEBUG({ success: true });
        res.send({ success: true, data: 'some secret you only get if you are authenticated' });

    } catch (error) {
        DEBUG({ error: error.toString() });
        res.send({ error: error.toString() });
    }
});

app.listen(parseInt(process.env.PORT) || 3000);
DEBUG('ready');