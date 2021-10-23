const http = require('http')

import { sign, utils } from '@privacess/lib';

const personal = "0x3b666dae2ffd82187a7c8a1f3d672cd21abfe697ae8349042974545c63809797";
const pubs     = [
    "0x04a6e9c2a99fc1955d1118f8a13998c4c657d8c64c04a17107d62ce0c2483a2d4ab4942436b2934aaa9e9080010054b907a8a7865a3f9e5bea1a36e250dedd6f0d",
    "0x042110998084370580d552b26b907678016ccf79fd9df79ab486e4a78591b0d3b154836091642bfcd79cddfd1b3587298aaceb99aa11c4eaea7d364a64cc7fd7c1",
    "0x042c53126ab0648e32c9449b562fed10751c9fc9bf4581b5d479e30df6e8ab8374c0e96aa23194b970d8334254e5de9b9616aea6b39411c996cb46232932b70cbf",
    "0x04c83fadcfc133bc55ca7306089dd00a2606bae6639b059e63977a2ceeb6212049068835325951e3e4455d3eede660a60365d2fad80be69238e464a5c3facd227e",
    "0x04b19b73df428d10ccf013ed95fe5df1e90cd69b91514df869c46d079b981b073548a2aeba0182da0f941633134da658692823b20d0d8b202b1221a59ec6334624",
    "0x0412ad2589e15771fdefad4491915ecc2d895bd7b81a4bb12d136e2075ebe47e84e9cc1d223520a18dd32cddfd8dad8d22204c117f77e26dec4b83807fb123d681",
    "0x04147350fc10d306e3acdbcc7fdc87d8daa8d850ff4d0c9042cf9199c45fef50329b0655af37daf192da3b088a2c521de8f60bc18bafa1eef5420acc5e58a98737",
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