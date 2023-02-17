const cannedResponse = (req, res) => {
    let timeout = req.query.proxyTimeout || process.env.proxyTimeout || 10000;
    return new Promise((resolve, reject) => {
        let canned = {};
        canned.status = 200;
        canned.body = res.locals.canned;
        setTimeout(resolve, timeout, canned);
    });
};

module.exports = {
    canned: cannedResponse
};

