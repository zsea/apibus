import md5 from './md5';
let cached = {};

function Request(opt, url, jsoner) {
  return fetch(url, {
    method: 'POST',
    body: jsoner.stringify(opt),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    if (response.status !== 200) {
      return new Promise(function (resolve) {
        resolve({
          error_response: {
            code: 10,
            msg: 'Service Currently Unavailable',
            sub_code: 'isp.remote-connection-error',
            sub_msg: '远程连接错误'
          }
        });
      });
    }
    return response.text().then(function (txt) {
      return jsoner.parse(txt);
    }).catch(function (e) {
      return {
        error_response: {
          code: 10,
          msg: 'Service Currently Unavailable',
          sub_code: 'isp.apibus-parse-error',
          sub_msg: 'api解析错误（出现了未被明确控制的异常信息）'
        }
      };
    });
  }).then(function (response) {
        //console.log("响应",JSON.stringify(response, null, 4));
    if (response.error_response && response.error_response.code == 52) {
      cached[opt['method']] = response.error_response.location;
      return Request(opt, response.error_response.location);
    }
    return response;
  });
}
function ApiBus(appkey, secret, url, jsoner) {
  jsoner = jsoner || window.JSON;
  url = url || 'http://apibus.tao11.la';
  this.Execute = function (method, options) {
    let opt = Object.assign({}, options);
    opt['appkey'] = appkey;
    opt['time'] = parseInt(Date.now() / 1000);
    opt['method'] = opt['method'] || method;
    opt['version'] = opt['version'] || 4.0;
    opt['format'] = 'json';
    opt['sign_method'] = 'md5';
    opt['request_mode'] = 'redirect';
    opt = Signature(opt, secret);
    let _url = cached[method] || url;
    return Request(opt, _url, jsoner).catch(function (e) {
      return {
        error_response: {
          code: 10,
          msg: 'Service Currently Unavailable',
          sub_code: 'isp.remote-connection-error',
          sub_msg: '远程连接错误'
        }
      };
    });
  };
  function Signature(options, secret) {

    let kv = [];
    for (let key in options) {
      let v = options[key];
      if (v === null || v === undefined || v === '' || key == 'signature')
        continue;
      if (typeof v === 'object') {
        kv.push(key + '=' + JSON.stringify(options[key]));
      }
      else {
        kv.push(key + '=' + options[key].toString());
      }
    }
    kv = kv.sort();
    let s = kv.join('&') + secret;
    options['signature'] = md5(s);
    return options;
  }
  this.__defineGetter__('appkey', function () {
    return appkey;
  });
  this.__defineGetter__('url', function () {
    return url;
  });
  this.__defineGetter__('secret', function () {
    return secret;
  });
}

export default ApiBus;
