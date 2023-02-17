const objectMapper = require('object-mapper');
const merge = require("deepmerge");

const isObject = (value) => {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
};

const mapper = (req, src, param) => {
    try {
        const directive = JSON.parse(req.query[param]);
        let mapped = objectMapper(src, directive);
        return mapped;
    } catch (error) {
        throw new Error("[" + param + "] param must be stringified json");
    }
};

const cannedBody = (req) => {
    let body = {};
    if (req.query["proxyQtoC"]) {
        const mapped = mapper(req, req.query, "proxyQtoC");
        if (mapped) {
            body = merge(body, mapped);
        }
    }
    if (req.query["proxyBtoC"]) {
        const mapped = mapper(req, req.body, "proxyBtoC");
        if (mapped) {
            body = merge(body, mapped);
        }
    }
    return body;
};

const actualBody = (req) => {
    let body = {};
    if (req.query["proxyQtoR"]) {
        const mapped = mapper(req, req.query, "proxyQtoR");
        if (mapped) {
            body = merge(body, mapped);
        }
    }
    if (req.query["proxyBtoR"]) {
        const mapped = mapper(req, req.body, "proxyBtoR");
        if (mapped) {
            body = merge(body, mapped);
        }
    }
    return body;
};

const bodyMapper = (req, res, next) => {
    try {
        res.locals.actual = actualBody(req);
        res.locals.canned = cannedBody(req);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    bodyMapper: bodyMapper
};