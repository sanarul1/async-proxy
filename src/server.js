
const express = require('express');
const app = express();
const { proxy } = require('./proxy.js');

const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(express.raw());

const cannedResponse = (req, res, next) => {
    return new Promise((resolve, reject) => {
        let canned = {};
        canned.body = {};
        if (req.query.expected) {
            if (req.query[req.query.expected]) {
                canned.status = 200;
                canned.body[req.query.expected] = req.query[req.query.expected];
            } else {
                canned.status = 400;
                canned.body.error = req.query.expected + ' not found';
            }
        }
        else {
            canned.status = 400;
            canned.body.error = '[expected] param not specified';
        }
        setTimeout(resolve, 30000, canned);
    });
};

const handler = (req, res, next) => {
    console.log('Proxying...')
    const canned = cannedResponse(req, res, next);
    const actual = proxy(req);
    Promise.race([canned, actual])
        .then((value) => {
            res.status(value.status).send(value.body);
        })
        .catch(next);
};

app.all('/*', handler);

app.listen(port, () => {
    console.log(`Proxy app listening on port ${port}`);
});
