const objectMapper = require('object-mapper');
const merge = require("deepmerge");

const isObject = (value) => {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
};

const extractor = (param) => {
    const valArr = param.split(",");
    let jsonStr = "{";
    for (var i = 0; i < valArr.length; i++) {
        const keyVal = valArr[i].split(":");
        if (keyVal.length === 2) {
            const fmt = "\"" + keyVal[0].trim() + "\":\"" + keyVal[1].trim() + "\"";
            jsonStr += fmt;
            if (i < valArr.length - 1) {
                jsonStr += ",";
            }
        }
    }
    jsonStr += "}";
    return jsonStr;
};

const mapper = (req, src, param) => {
    try {
        const jsonStr = extractor(req.query[param]);
        console.log(jsonStr);
        const directive = JSON.parse(jsonStr);
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
