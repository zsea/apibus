var cfg = require("../configure/cfg")
    , moment = require("moment")
    , APIBus = require('./sdk');

let apis = {
    "apibus.time.get": {
        fields: [],
        desc: "获取系统时间",
        handler: {
            type: "function",
            value: async function (ctx) {
                return { time: Date.now(), node: cfg.CLUSTER.NODENAME };
            }
        }
    },
    /**以下API用于集群中通信 */
    "apibus.sync.api.del": {
        desc: "集群同步时删除一个api",
        fields: [{
            name: "api",
            type: "string",
            required: true,
            desc: "需要删除的接口名称"
        }, {
            name: "token",
            type: "string",
            required: true,
            desc: "同步时的通信token"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"], token = form["token"];
                if (token !== cfg.CLUSTER.TOKEN) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:token",
                            sub_msg: "集群通信token无效。"
                        }
                    }
                }
                await redis.hdel("apis", api);
                return {
                    success: true
                }
            }
        }
    },
    "apibus.sync.api.update": {
        desc: "集群同步时更新一个api",
        fields: [{
            name: "api",
            type: "string",
            required: true,
            desc: "需要更新的接口名称"
        }, {
            name: "token",
            type: "string",
            required: true,
            desc: "同步时的通信token"
        }, {
            name: "info",
            type: "json",
            required: true,
            desc: "更新的数据，需要是有效的JSON格式"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"], token = form["token"], info = form["info"];
                if (token !== cfg.CLUSTER.TOKEN) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:token",
                            sub_msg: "集群通信token无效。"
                        }
                    }
                }
                info = JSON.parse(info);
                info.fields = info.fields || [];
                if (!info.handler || info.handler.type != "url") {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:info.handler.url",
                            sub_msg: "接口处理器错误。"
                        }
                    }
                }
                await redis.hset("apis", api, JSON.stringify(info));
                return {
                    success: true
                }
            }
        }
    },
    "apibus.sync.app.del": {
        desc: "集群同步时删除一个app",
        fields: [{
            name: "app",
            type: "number",
            required: true,
            desc: "需要删除的appkey"
        }, {
            name: "token",
            type: "string",
            required: true,
            desc: "同步时的通信token"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"], token = form["token"];
                if (token !== cfg.CLUSTER.TOKEN) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:token",
                            sub_msg: "集群通信token无效。"
                        }
                    }
                }
                await redis.hdel("apps", app);
                return {
                    success: true
                }
            }
        }
    },
    "apibus.sync.app.update": {
        desc: "集群同步时更新一个api",
        fields: [{
            name: "app",
            type: "number",
            required: true,
            desc: "需要删除的appkey"
        }, {
            name: "token",
            type: "string",
            required: true,
            desc: "同步时的通信token"
        }, {
            name: "info",
            type: "json",
            required: true,
            desc: "更新的数据，需要是有效的JSON格式"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"], token = form["token"], info = form["info"];
                if (token !== cfg.CLUSTER.TOKEN) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:token",
                            sub_msg: "集群通信token无效。"
                        }
                    }
                }
                await redis.hset("apps", app, info);
                return {
                    success: true
                }
            }
        }
    },
    "apibus.sync.session.update": {
        desc: "集群同步时更新一个session",
        fields: [{
            name: "token",
            type: "string",
            required: true,
            desc: "同步时的通信token"
        }, {
            name: "session_key",
            type: "string",
            required: true,
            desc: "同步时的需要更新的redis key"
        }, {
            name: "session_value",
            type: "string",
            required: true,
            desc: "同步时的需要更新的redis value"
        }, {
            name: "expires_in",
            type: "number",
            required: true,
            desc: "session过期时间"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let session_key = form["session_key"]
                    , token = form["token"]
                    , session_value = form["session_value"]
                    , expires_in = Number(form["expires_in"]);
                if (token !== cfg.CLUSTER.TOKEN) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:token",
                            sub_msg: "集群通信token无效。"
                        }
                    }
                }
                await redis.set(session_key, session_value, "PX", expires_in)
                return {
                    success: true
                }
            }
        }
    },
    "apibus.sync.session.del": {
        desc: "集群同步时删除一个session",
        fields: [{
            name: "token",
            type: "string",
            required: true,
            desc: "同步时的通信token"
        }, {
            name: "session_key",
            type: "string",
            required: true,
            desc: "同步时的需要删除的redis key"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let session_key = form["session_key"]
                    , token = form["token"];
                if (token !== cfg.CLUSTER.TOKEN) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:token",
                            sub_msg: "集群通信token无效。"
                        }
                    }
                }
                await redis.del(session_key);
                return {
                    success: true
                }
            }
        }
    }
}
if (cfg.CLUSTER.MANAGER) {
    let manager = require("./manager");
    apis = Object.assign(apis, manager);
}
global.SYSTEM_APIS = apis;
module.exports = apis;