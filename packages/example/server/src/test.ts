const http = require('http')

import { sign, utils } from '@privacess/lib';

const personal = "0x358be44145ad16a1add8622786bef07e0b00391e072855a5667eb3c78b9d3803";
const pubs     = [
    "0x045655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068a",
    "0x046655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068b",
    "0x047655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068c",
    "0x048655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068d",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068e",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0680",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0681",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0682",
    "0x049655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c0683",
];

function query({
    hostname,
    port,
    path,
    method,
    headers = { 'Content-Type': 'application/json' },
    data
}) {
    return new Promise((resolve, reject) => {
        const chunks = []
        const req = http.request(
            { hostname, port, path, method, headers },
            res => {
                res.on('data', d => { chunks.push(d); });
                res.on('end', () => { resolve(chunks.join('')); });
            },
        );
        req.on('error', reject);
        req.write(JSON.stringify(data))
        req.end()
    });
}

query({
    method:   'POST',
    hostname: 'localhost',
    port:     3000,
    path:     '/secure',
    data:     { sig: utils.serialize(sign("message", personal, pubs)) },
}).then(console.log);

query({
    method:   'POST',
    hostname: 'localhost',
    port:     3000,
    path:     '/secure',
    data:     { sig: utils.serialize(sign("wrong message", personal, pubs)) },
}).then(console.log);