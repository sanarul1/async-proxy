const express = require('express');
const app = express();
var logger = require('morgan');
const { bodyMapper } = require('./mapper');
const { axiosConfig } = require('./axiosConfig');
const { canned } = require('./canned');
const { proxy } = require('./proxy');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());
app.use(express.raw());

app.use(bodyMapper);
app.use(axiosConfig);

app.use((err, req, res, next) => {
    console.log(err.message);
    const body = {};
    body.status = 400;
    body.message = err.message;
    res.status(400).send(body)
});

const handler = (req, res, next) => {
    console.log('Proxying...');

    const cannedData = canned(req, res);
    const actualData = proxy(req, res);
    Promise.race([cannedData, actualData])
        .then((value) => {
            res.status(value.status).send(value.body);
        })
        .catch(next);
};

app.all('/*', handler);

module.exports = app;
