global.Promise = require("bluebird");
var cfg = require("./configure/cfg");
var log4js = require("log4js");
var logger = log4js.getLogger("APIBus");
logger.level = cfg.RUN_LOG_LEVEL;

const idCreate = require("./lib/id");

var Redis = require("ioredis");
var redis = new Redis(cfg.REDIS);

global.logger = logger;
global.redis = redis;

var Koa = require('koa');
const memory = require("./lib/redis");
const fetch = require("node-fetch");
const qs = require("querystring");


var app = new Koa();
const cors = require('koa2-cors');
app.use(cors({
    origin: function (ctx) {
        let origin = ctx.header.origin;
        //logger.trace(ctx.header.origin);
        for (let i = 0; i < cfg.CORS.domain.length; i++) {
            let item = cfg.CORS.domain[i];
            if (item === "*") {
                return origin;
            }
            if (typeof item === "string") {
                if (item === origin) {
                    return origin;
                }
            }
            else if (item.test && typeof item.test === "function") {
                if (item.test(origin)) {
                    return origin;
                }
            }

        }
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 3600,
    credentials: false,
    allowMethods: ['POST', "OPTIONS"],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

var bodyParser = require('koa-bodyparser');
app.use(bodyParser(cfg.BODY));
//var body = require('koa-better-body')
//app.use(body(cfg.BODY));

const crypto = require('crypto');
const common_fields = ['appkey', 'time', 'signature', 'method', 'version', 'session', 'format', 'sign_method', 'ignore_fields'];
function sign(appSecret, options, isv_fields) {
    isv_fields = isv_fields || [];
    var ignore_fields = options['ignore_fields'];
    if (!ignore_fields) {
        ignore_fields = [];
    }
    else {
        ignore_fields = ignore_fields.split(',');
    }
    var data = [];
    for (var key in options) {
        var v = options[key];
        if (v === null || v === undefined || v === '' || key == 'signature') {
            continue;
        }
        if (ignore_fields.indexOf(key) > -1 && common_fields.indexOf(key) == -1 && isv_fields.indexOf(key) == -1) {
            continue;
        }
        data.push(key + '=' + v.toString());
    }
    data = data.sort();
    var s = data.join('&');
    s = s + appSecret;
    var md5 = crypto.createHash('md5');
    md5.update(s, 'utf8');
    var sign = md5.digest('hex');
    sign = sign.toUpperCase();
    return sign;
}
function byteLength(str) {
    if (!str) return 0;
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            len += 2;
        }
        else {
            len += 1;
        }
    }
    return len;
}
app.use(async function (ctx, next) {
    //console.log("test");
    await next();
    const form = ctx.request.body;
    if (form["version"] == 4.0 && form["method"]) {
        var v = {}
        if (!ctx.body.error_response) {
            var root = form.method.replace(/\./ig, "_");
            root = root + "_response";
            if (v[root] === undefined) {
                v[root] = ctx.body;
            }
        }
        else {
            v = ctx.body;
        }


        if (cfg.REQUEST_LOG.HANDLER == "redis") {
            v["request_id"] = idCreate();
            let userip = ctx.req.headers["apibus-user-ip"] || ctx.req.client.remoteAddress;
            redis.lpush("apibus:logs", JSON.stringify({
                request: form,
                response: v,
                request_id: v["request_id"],
                user_ip: userip
            }));
        }
        else if (cfg.REQUEST_LOG.HANDLER == "fetch") {
            v["request_id"] = idCreate();
            let userip = ctx.req.headers["apibus-user-ip"] || ctx.req.client.remoteAddress;
            fetch(cfg.REQUEST_LOG.URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    request: form,
                    response: v,
                    request_id: v["request_id"],
                    user_ip: userip
                })
            }).then(function (res) {
                if (res.status != 200) {
                    logger.warn("日志服务出错，HttpStatus", res.status);
                }
                return res.text();
            }).then(function (txt) {
                let ret = undefined;
                try {
                    ret = JSON.parse(txt);
                }
                catch (e) {
                    logger.error("日志服务响应错误", txt);
                    return;
                }
                if (!ret.success) {
                    logger.warn("日志服务响应错误", JSON.stringify(ret, null, 4));
                }
            }).catch(function (e) {
                logger.error("日志服务发生未知错误", e);
            });
        }

        ctx.body = v;
    }
})
app.use(async function (ctx, next) {
    if (ctx.method != "POST") {
        ctx.body = { error_response: { code: 9, msg: 'Http Action Not Allowed' } };
        return;
    }
    //console.log(ctx.request.body);
    //const form = ctx.request.fields || ctx.request.body || ctx.request.files || {};
    const form = ctx.request.body;
    const _origin_form = Object.assign({}, form);
    var api_method = form['method'], appkey = form['appkey']
        , signature = form['signature'], timestamp = form['time'], version = form['version']
        , format = form['format'], sign_method = form['sign_method'], session = form['session']
        , request_mode = form["request_mode"];
    logger.trace("请求", api_method);
    logger.trace("入参", JSON.stringify(form, null, 4));
    if (request_mode === null || request_mode === undefined || request_mode === "") {
        request_mode = "proxy";
    }
    if (format != 'json') {
        logger.trace('format is:' + format);
        ctx.body = { error_response: { code: 23, msg: 'Invalid Format' } };
        return;
    }
    if (sign_method != 'md5') {
        logger.trace('sign_method is ' + sign_method);
        ctx.body = { error_response: { code: 51, msg: 'Invalid Sign Method' } };
        return;
    }
    if (appkey === null || appkey === undefined) {
        ctx.body = { error_response: { code: 28, msg: 'Missing App Key' } };
        return;
    }
    if (!signature) {
        ctx.body = { error_response: { code: 24, msg: 'Missing Signature' } };
        return;
    }
    if (!api_method) {
        ctx.body = { error_response: { code: 21, msg: 'Missing Method' } };
        return;
    }
    if (!timestamp) {
        ctx.body = { error_response: { code: 30, msg: 'Missing Timestamp' } };
        return;
    }
    if (isNaN(timestamp)) {
        ctx.body = { error_response: { code: 31, msg: 'Invalid Timestampp' } };
        return;
    }
    if (Date.now() / 1000 - timestamp > 10 * 60) {

        logger.trace('服务器时间：' + (Date.now() / 1000));
        logger.trace('用户时间：' + timestamp);
        ctx.body = { error_response: { code: 31, msg: 'Invalid Timestampp' } };
        return;
    }
    if (!version) {
        ctx.body = { error_response: { code: 32, msg: 'Missing Version' } };
        return;
    }
    if (isNaN(version)) {
        ctx.body = { error_response: { code: 33, msg: 'Invalid Version' } };
        return;
    }
    if (version != 3.0 && version != 4.0) {
        ctx.body = { error_response: { code: 34, msg: 'Unsupported Version' } };
        return;
    }
    if (request_mode != "proxy" && request_mode != "redirect") {
        ctx.body = { error_response: { code: 48, msg: 'Invalid Request Mode' } };
        return;
    }
    var appinfo = await memory.get_app(appkey);
    if (!appinfo) {
        ctx.body = { error_response: { code: 29, msg: 'Invalid App Key' } };
        return;
    }
    //logger.trace("流量检查", appkey)
    if (!(await memory.add_flow(appkey, appinfo.flow))) {
        ctx.body = { error_response: { code: 7, msg: 'App Call Limited' } };
        return;
    }
    var apiinfo = await memory.get_method(api_method);
    if (!apiinfo) {
        ctx.body = { error_response: { code: 22, msg: 'Invalid Method' } };
        return;
    }
    let redirect_url;
    if (apiinfo.env && apiinfo.env.name != cfg.CLUSTER.NODENAME) {
        if (request_mode == "redirect") {
            ctx.body = {
                error_response: {
                    code: 52,
                    msg: 'Redirect Url',
                    location: apiinfo.env.url
                }
            };
            return;
        }
        else {
            redirect_url = apiinfo.env.url;
        }
    }
    var isv_fields = [];
    if (apiinfo.fields) {
        for (var i = 0; i < apiinfo.fields.length; i++) {
            if (apiinfo.fields[i].type == 'binary') continue;
            isv_fields.push(apiinfo.fields[i]['name']);
        }
    }
    var server_sign = sign(appinfo.secret, form, isv_fields);
    if (server_sign.toUpperCase() != signature.toUpperCase()) {
        ctx.body = { error_response: { code: 25, msg: 'Invalid Signature' } };
        return;
    }
    //检查session
    if (apiinfo.must_session) {
        if (!session) {
            ctx.body = { error_response: { code: 26, msg: 'Missing Session' } };
            return;
        }
    }
    var user_token = null;
    if (session) {
        user_token = await memory.get_user(session, appkey);
        if (!user_token) {
            ctx.body = { error_response: { code: 27, msg: 'Invalid Session' } };
            return;
        }
    }
    /*
    if (user_token) {
        form['session'] = JSON.stringify(user_token);
    }*/
    //开始验证权限
    //console.log(typeof appinfo);
    logger.trace('可访问API：' + JSON.stringify(appinfo.apis))
    logger.trace('当前调用api:' + api_method);
    if (appinfo.apis !== '*' && (appinfo.apis || []).indexOf(api_method) == -1) {
        ctx.body = {
            error_response: {
                code: 11, msg: 'Insufficient ISV Permissions'
                , sub_code: 'isv.permission-api-package-not-allowed'
                , sub_msg: '不允许访问不可访问组的API'
            }
        };
        return;
    }
    var userip = ctx.req.headers["apibus-user-ip"] || ctx.req.client.remoteAddress;
    if (appinfo.level == 'ipwhite' && appinfo.ipwhite.indexOf(userip) == -1) {
        logger.trace('用户IP：' + userip);
        logger.trace('应用等级：' + appinfo.level);
        logger.trace('IP名单：' + appinfo.ipwhite);
        ctx.body = {
            error_response: {
                code: 11, msg: 'Insufficient ISV Permissions'
                , sub_code: 'isv.permission-ip-whitelist-limit'
                , sub_msg: 'IP限制不允许访问'
            }
        };
        return;
    }
    //开始校验方法参数
    for (var i = 0; i < apiinfo.fields.length; i++) {
        var field = apiinfo.fields[i];
        var value = form[field.name];
        //logger.trace("参数",field.name,value,form)
        if (field.required && (value === null || value === undefined)) {
            ctx.body = {
                error_response: {
                    code: 40, msg: 'Missing Required Arguments'
                    , sub_code: 'ise.missing-required-arguments:' + field.name
                    , sub_msg: '缺少必选参数：' + field.name
                }
            }
            return;
        }
        if (value === null || value === undefined || value === "") continue;
        if (field.type == 'number' && isNaN(value)) {
            ctx.body = {
                error_response: {
                    code: 41, msg: 'Invalid Arguments'
                    , sub_code: 'ise.invalid-arguments:' + field.name
                    , sub_msg: '参数' + field.name + '的类型必须为number'
                }
            };
            return;
        }
        if (field.type == 'boolean' && value !== 'true' && value !== 'false' && value !== true && value !== false) {
            ctx.body = {
                error_response: {
                    code: 41, msg: 'Invalid Arguments'
                    , sub_code: 'ise.invalid-arguments:' + field.name
                    , sub_msg: '参数' + field.name + '的类型必须为boolean'
                }
            };
            return;
        }
        if (field.type == 'number') {
            value = Number(value);
            if (field.min !== undefined
                && field.min !== null
                && !isNaN(field.min)
                && value < field.min) {
                ctx.body = {
                    error_response: {
                        code: 43, msg: 'Parameter Error'
                        , sub_code: 'ise.parameter-error-min:' + field.name
                        , sub_msg: '参数' + field.name + '的值必须大于等于' + field.min
                    }
                };
                return;
            }
            if (field.max !== undefined
                && field.max !== null
                && !isNaN(field.max)
                && value > field.max) {
                ctx.body = {
                    error_response: {
                        code: 43, msg: 'Parameter Error'
                        , sub_code: 'ise.parameter-error-max:' + field.name
                        , sub_msg: '参数' + field.name + '的值必须小于等于' + field.max
                    }
                };
                return;
            }
        }
        if (field.type == 'string' || field.type == "json" || field.type == "json-array") {
            if (field.maxLength) {
                if (field.maxLength < byteLength(value)) {
                    ctx.body = {
                        error_response: {
                            code: 43, msg: 'Parameter Error'
                            , sub_code: 'ise.parameter-error-maxlength:' + field.name
                            , sub_msg: '参数' + field.name + '的最大长度不能大于' + field.maxLength + '个字节。'
                        }
                    };
                    return;
                }
            }
        }
        if (field.type == "enum") {
            var list_enums = (field.list || '').split(',');
            if (!list_enums.some(function (_item) {
                return _item == value
            })) {
                ctx.body = {
                    error_response: {
                        code: 43, msg: 'Parameter Error'
                        , sub_code: 'ise.parameter-error-range:' + field.name
                        , sub_msg: '参数' + field.name + '的值必须属于集合[' + field.list + ']'
                    }
                };
                return;
            }
        }
        else if (field.type == "json") {
            try {
                var test_v = JSON.parse(value);
                form[field.name] = test_v;
            }
            catch (e) {
                ctx.body = {
                    error_response: {
                        code: 43, msg: 'Parameter Error'
                        , sub_code: 'ise.parameter-error-type:' + field.name
                        , sub_msg: '参数' + field.name + '必须是有效的json字符串'
                    }
                }
                return;
            }
        }
        else if (field.type == "json-array") {
            try {
                var test_v = JSON.parse(value);
                form[field.name] = test_v;
            }
            catch (e) {
                ctx.body = {
                    error_response: {
                        code: 43, msg: 'Parameter Error'
                        , sub_code: 'ise.parameter-error-type:' + field.name
                        , sub_msg: '参数' + field.name + '必须是有效的json数组字符串'
                    }
                }
                return;
            }
            if (!Array.isArray(test_v)) {
                ctx.body = {
                    error_response: {
                        code: 43, msg: 'Parameter Error'
                        , sub_code: 'ise.parameter-error-type:' + field.name
                        , sub_msg: '参数' + field.name + '必须是有效的json数组字符串'
                    }
                }
                return;
            }
        }
    }
    if (apiinfo.handler.type == "function") {
        if (!apiinfo.handler.value) {
            ctx.body = { error_response: { code: 22, msg: 'Invalid Method' } }
        }
        else {
            ctx.body = await apiinfo.handler.value(ctx, form);
        }
    }
    else if (apiinfo.handler.type == "url") {
        let body = "";
        if (redirect_url) {
            body = JSON.stringify(_origin_form);
        }
        else if (user_token) {
            body = JSON.stringify(Object.assign({}, form, { session: JSON.stringify(user_token.value) }));
        }
        else {
            body = JSON.stringify(form);
        }
        let response = await fetch(redirect_url || apiinfo.handler.value, {
            method: "POST",
            headers: {
                "APIBUS-USER-IP": userip,
                "Content-Type": "application/json"
            },
            body: body
        });
        if (response.status != 200) {
            ctx.body = { error_response: { code: 10, msg: 'Service Currently Unavailable', sub_code: 'isp.remote-service-error', sub_msg: '连接远程服务错误' } };
            return;
        }
        try {
            ctx.body = await response.json();
        }
        catch (e) {
            ctx.body = { error_response: { code: 10, msg: 'Service Currently Unavailable', sub_code: 'isp.apibus-parse-error', sub_msg: 'api解析错误（出现了未被明确控制的异常信息）' } };
            return;
        }

    }
    else {
        ctx.body = { error_response: { code: 22, msg: 'Invalid Method' } }
    }
    //ctx.body = {}
});

let port = process.env["APIBUS_PORT"] || 3000;
app.listen(port, function (err) {
    if (err) {
        logger.error('Run error', err);
        process.exit(1);
    }
    else {
        logger.info('Runing in port ' + port + '.')
    }
});