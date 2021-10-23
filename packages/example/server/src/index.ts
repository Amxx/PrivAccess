import express     from 'express';
import body_parser from 'body-parser';

import { verify, utils } from '@privacess/lib';

const app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

app.get('/', async function (req, res) {
    res.send('works');
});

function runCheck(address) {
    console.log('run check for', address);
    return true;
}

app.post('/secure', async function (req, res) {
    try {
        console.log(req.body);
        const message   = 'message';
        const sign      = utils.deserialize(req.body.sig);
        const addresses = sign.ring.map(keyish => utils.keyFromPublicOrSigner(keyish)).map(utils.getAddress);

        const check = runCheck;

        if (check && !addresses.every(check)) {
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

app.listen(3000);
