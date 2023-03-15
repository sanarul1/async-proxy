const dropQueryParams = ['proxyUrl', 'proxyQtoC', 'proxyBtoC', 'proxyQtoR', 'proxyBtoR', 'proxyTimeout'];

const dropHeaders = ['host', "content-length"];

const isValidUrl = (str) => {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
};

const findKey = (object, key) => {
    return Object.keys(object).find(k => k.toLowerCase() === key.toLowerCase());
};

const filterObj = (obj, keyArr) => {
    let { ...clone } = obj;
    keyArr.forEach(element => {
        let key = findKey(clone, element);
        if (key) {
            delete clone[key];
        }
    });
    return clone;
};

const cloneActual = (req) => {
    const config = {};
    config.headers = {};
    let path = '';
    let params = '';
    let query = '';
    if (req.query.proxyUrl) {
        let valid = isValidUrl(req.query.proxyUrl);
        if (!valid) {
            throw new Error('[proxyUrl] param value is incorrect');
        }

        path = (req.path == '/') ? '' : req.path;

        if (req.params) {
            params = '/' + Object.keys(req.params).map(function (key) {
                return req.params[key];
            }).join('/');
        }

        if (req.query) {
            const queryClone = filterObj(req.query, dropQueryParams);
            if (Object.keys(queryClone).length > 0) {
                query = '?' + Object.keys(queryClone).map(function (key) {
                    return key + '=' + queryClone[key];
                }).join('&');
            }
        }

        config.url = (req.query.proxyUrl + path + params + query).replace(/\/$/, '');
    } else {
        throw new Error('[proxyUrl] param not specified');
    }

    config.method = req.method;

    if (req.headers) {
        const headersClone = filterObj(req.headers, dropHeaders);
        config.headers = headersClone;
    }

    if (req.body) {
        config.data = req.body;
    }

    console.log(config);
    return config;
};

const axiosConfig = (req, res, next) => {
    try {
        res.locals.config = cloneActual(req);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    axiosConfig: axiosConfig
};
