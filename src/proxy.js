const axios = require('axios');
const merge = require("deepmerge");

const proxy = async (req, res) => {
  let data = {};
  try {
    const config = res.locals.config;
    await axios(config)
      .then((response) => {
        //setTimeout(()=>{}, 20);
        console.log('Response from back-end');
        data.status = response.status;
        data.statusText = response.statusText;
        data.body = merge(res.locals.actual, response.data);
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
