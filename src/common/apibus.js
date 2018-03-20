import md5 from './md5';
function ApiBus(appkey, secret, url) {
    url = url || 'http://apibus.tao11.la';
    this.Execute = function (method, options) {
        var opt = Object.assign({}, options);
        opt['appkey'] = appkey;
        opt['time'] = parseInt(Date.now() / 1000);
        opt['method'] = opt['method'] || method;
        opt['version'] = opt['version'] || 3.0;
        opt['format'] = 'json';
        opt['sign_method'] = 'md5';
        opt = Signature(opt, secret);
        /*var formData = new FormData();
        for (var name in opt) {
            var v = opt[name];
            if (v === undefined || v === null) {
                v = '';
            }
            formData.append(name, v);
        }*/
        return fetch(url, {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(opt),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(function (response) {
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
                    })
                }
                try {
                    return response.json();
                } catch (e) {
                    resolve({
                        error_response: {
                            code: 10,
                            msg: 'Service Currently Unavailable',
                            sub_code: 'isp.apibus-parse-error',
                            sub_msg: 'api解析错误（出现了未被明确控制的异常信息）'
                        }
                    });
                }
            }).catch(function (e) {
                return {
                    error_response: {
                        code: 10,
                        msg: 'Service Currently Unavailable',
                        sub_code: 'isp.remote-connection-error',
                        sub_msg: '远程连接错误'
                    }
                }
            });
    }
    function Signature(options, secret) {

        var kv = [];
        for (var key in options) {
            var v = options[key];
            if (v === null || v === undefined || v === '' || key == 'signature')
                continue;
            kv.push(key + '=' + options[key].toString());
        }
        kv = kv.sort();
        var s = kv.join('&') + secret;
        options['signature'] = md5(s);
        return options;
    }
    this.__defineGetter__("appkey", function () {
        return appkey;
    });
    this.__defineGetter__("url", function () {
        return url;
    });
    this.__defineGetter__("secret", function () {
        return secret;
    });
}
ApiBus.__defineGetter__("bus", function () {
    let appkey = window.localStorage.getItem("apibus:appkey");
    let url = window.localStorage.getItem("apibus:url");
    let secret = window.sessionStorage.getItem("apibus:secret");
    return new ApiBus(appkey, secret, url);
});
//var bus = new ApiBus('0', '0', "http://127.0.0.1:3000");
export default ApiBus;
/*
export {
    bus
}*/
