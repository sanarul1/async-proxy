const axios = require('axios');

const dropQueryParams = ['url', 'expected'];

const dropHeaders = ['host', "content-length"];

const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
};

const filterObj = (obj, keyArr) => {
  let { ...clone } = obj;
  keyArr.forEach(element => {
    if (clone.hasOwnProperty(element)) {
      delete clone[element];
    }
  });
  return clone;
};

const cloneActual = (req) => {
  const config = {};
  config.headers = {};
  let params = '';
  let query = '';
  if (req.query.url) {
    let valid = isValidUrl(req.query.url);
    if (!valid) {
      throw new Error('[url] param value is incorrect');
    }

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

    config.url = req.query.url + params + query;
  } else {
    throw new Error('[url] param not specified');
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

const proxy = async (req) => {
  let data = {};
  try {
    await axios(cloneActual(req))
      .then((response) => {
        //setTimeout(()=>{}, 20);
        console.log('Response from back-end');
        data.status = response.status;
        data.statusText = response.statusText;
        data.body = response.data;
        console.log(data.body);
      })
      .catch(err => {
        data = {};
        if (err.response) {
          data.status = err.response.status;
          data.body = {};
          data.body.code = err.code;
          data.body.status = err.response.status;
          data.body.statusText = err.response.statusText;
          data.body.error = err.response.data;
        }
        console.error(err);
      });
  } catch (error) {
    data.body = {};
    data.status = 400;
    data.body.error = error.message;
  };

  return data;
};

module.exports = {
  proxy: proxy
};
