/**
 * 管理用的api列表，仅用于manager节点
 */
var cfg = require("../configure/cfg")
    , db = require("zsea-mysql")
    , moment = require("moment")
    , APIBus = require('./sdk')
    , createSecret = require("./id");
db.set(cfg.MYSQL);

async function getAllEnv() {
    let envs = await db.table("envs").where("name", cfg.CLUSTER.NODENAME, "<>").select("id", "name", "url").array();
    return envs;
}
async function ApiSyncDel(api) {
    let envArray = await getAllEnv();
    let busArray = envArray.map(function (e) {
        return new Promise(function (resolve) {
            let bus = new APIBus(cfg.ADMIN.APPKEY, cfg.ADMIN.SECRET, e.url);
            resolve(bus);
        }).then(function (bus) {
            return bus.Execute("apibus.sync.api.del", {
                api: api,
                token: cfg.CLUSTER.TOKEN
            })
        })
    });
    busArray = await Promise.all(busArray);
    let failed = [];
    busArray.forEach(function (b, _index) {
        if (b.error_response) {
            failed.push(envArray[_index].name);
        }
    });
    if (failed.length > 0) {
        return {
            error_response: {
                code: 99,
                msg: "",
                sub_code: "isv.sync-fail",
                msg: "节点" + failed.join(",") + "同步失败。"
            }
        }
    }
    return {
        success: true
    }
}
async function ApiSyncUpdate(api, info) {
    let envArray = await getAllEnv();
    let busArray = envArray.map(function (e) {
        return new Promise(function (resolve) {
            let bus = new APIBus(cfg.ADMIN.APPKEY, cfg.ADMIN.SECRET, e.url);
            resolve(bus);
        }).then(function (bus) {
            return bus.Execute("apibus.sync.api.update", {
                api: api,
                token: cfg.CLUSTER.TOKEN,
                info: JSON.stringify(info)
            })
        })
    });
    busArray = await Promise.all(busArray);
    let failed = [];
    busArray.forEach(function (b, _index) {
        if (b.error_response) {
            failed.push(envArray[_index].name);
        }
    });
    if (failed.length > 0) {
        return {
            error_response: {
                code: 99,
                msg: "",
                sub_code: "isv.sync-fail",
                msg: "节点" + failed.join(",") + "同步失败。"
            }
        }
    }
    return {
        success: true
    }
}
async function AppSyncDel(app) {
    let envArray = await getAllEnv();
    let busArray = envArray.map(function (e) {
        return new Promise(function (resolve) {
            let bus = new APIBus(cfg.ADMIN.APPKEY, cfg.ADMIN.SECRET, e.url);
            resolve(bus);
        }).then(function (bus) {
            return bus.Execute("apibus.sync.app.del", {
                app: app,
                token: cfg.CLUSTER.TOKEN
            })
        })
    });
    busArray = await Promise.all(busArray);
    let failed = [];
    busArray.forEach(function (b, _index) {
        if (b.error_response) {
            failed.push(envArray[_index].name);
        }
    });
    if (failed.length > 0) {
        return {
            error_response: {
                code: 99,
                msg: "",
                sub_code: "isv.sync-fail",
                msg: "节点" + failed.join(",") + "同步失败。"
            }
        }
    }
    return {
        success: true
    }
}
async function AppSyncUpdate(app, info) {
    let envArray = await getAllEnv();
    let busArray = envArray.map(function (e) {
        return new Promise(function (resolve) {
            let bus = new APIBus(cfg.ADMIN.APPKEY, cfg.ADMIN.SECRET, e.url);
            resolve(bus);
        }).then(function (bus) {
            return bus.Execute("apibus.sync.app.update", {
                app: app,
                token: cfg.CLUSTER.TOKEN,
                info: JSON.stringify(info)
            })
        })
    });
    busArray = await Promise.all(busArray);
    let failed = [];
    busArray.forEach(function (b, _index) {
        if (b.error_response) {
            failed.push(envArray[_index].name);
        }
    });
    if (failed.length > 0) {
        return {
            error_response: {
                code: 99,
                msg: "",
                sub_code: "isv.sync-fail",
                msg: "节点" + failed.join(",") + "同步失败。"
            }
        }
    }
    return {
        success: true
    }
}
async function SessionSyncUpdate(key, value, expires_in) {
    let envArray = await getAllEnv();
    let busArray = envArray.map(function (e) {
        return new Promise(function (resolve) {
            let bus = new APIBus(cfg.ADMIN.APPKEY, cfg.ADMIN.SECRET, e.url);
            resolve(bus);
        }).then(function (bus) {
            return bus.Execute("apibus.sync.session.update", {
                token: cfg.CLUSTER.TOKEN,
                session_key: key,
                session_value: value,
                expires_in: expires_in
            })
        })
    });
    busArray = await Promise.all(busArray);
    let failed = [];
    busArray.forEach(function (b, _index) {
        if (b.error_response) {
            failed.push(envArray[_index].name);
        }
    });
    if (failed.length > 0) {
        return {
            error_response: {
                code: 99,
                msg: "",
                sub_code: "isv.sync-fail",
                msg: "节点" + failed.join(",") + "同步失败。"
            }
        }
    }
    return {
        success: true
    }
}
async function SessionSyncDel(key) {
    let envArray = await getAllEnv();
    let busArray = envArray.map(function (e) {
        return new Promise(function (resolve) {
            let bus = new APIBus(cfg.ADMIN.APPKEY, cfg.ADMIN.SECRET, e.url);
            resolve(bus);
        }).then(function (bus) {
            return bus.Execute("apibus.sync.session.del", {
                token: cfg.CLUSTER.TOKEN,
                session_key: key
            })
        })
    });
    busArray = await Promise.all(busArray);
    let failed = [];
    busArray.forEach(function (b, _index) {
        if (b.error_response) {
            failed.push(envArray[_index].name);
        }
    });
    if (failed.length > 0) {
        return {
            error_response: {
                code: 99,
                msg: "",
                sub_code: "isv.sync-fail",
                msg: "节点" + failed.join(",") + "同步失败。"
            }
        }
    }
    return {
        success: true
    }
}
module.exports = {
    "apibus.apis.get": {
        fields: [
            {
                name: "page",
                type: "number",
                defaultValue: "1",
                required: false,
                min: 1,
                desc: "页码"
            },
            {
                name: "size",
                type: "number",
                defaultValue: "10",
                required: false,
                min: 1,
                max: 100,
                desc: "每页获取的数量"
            },
            {
                name: "status",
                type: "enum",
                required: false,
                list: "enable,disabled",
                desc: "查询的api的状态，可选值：enable、disable"
            },
            {
                name: "keyword",
                type: "string",
                required: false,
                desc: "查询关键词"
            }, {
                name: "groupids",
                type: "string",
                required: false,
                desc: "过滤的分组id，多个用英文逗号分隔"
            }, {
                name: "envids",
                type: "string",
                required: false,
                desc: "过滤的环境id，多个用英文逗号分隔"
            }
        ],
        desc: "获取系统中的api列表。",
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let page = form["page"]
                    , size = form["size"]
                    , status = form["status"]
                    , keyword = form['keyword']
                    , groupid = form["groupids"] ? form["groupids"].split(",") : []
                    , envid = form["envids"] ? form["envids"].split(",") : [];
                if (isNaN(page)) page = 1;
                if (page < 1) page = 1;
                if (isNaN(size)) size = 10;
                if (size < 1) size = 10;
                let systemApis = Object.keys(global.SYSTEM_APIS);
                if (status == "disabled") {
                    systemApis = [];
                }
                if (groupid && groupid.length) {
                    systemApis = [];
                }
                if (envid && envid.length) {
                    systemApis = [];
                }
                if (keyword && systemApis.length > 0) {
                    systemApis = systemApis.filter(function (a) {
                        return a.indexOf(keyword) > -1;
                    });
                }
                let query = db.table("apis");
                if (status) {
                    query = query.where({ status: status });
                }
                if (keyword) {
                    query = query.where("method", "%" + keyword + "%", 'like');
                }
                if (groupid && groupid.length) {
                    query = query.where({ groupid: groupid });
                }
                if (envid && envid.length) {
                    query = query.where({ envid: envid });
                }
                let total = await query.count() + systemApis.length;
                if (total <= (page - 1) * size) {
                    return {
                        total: total,
                        apis: []
                    }
                }
                let rangeMin = (page - 1) * size, rangeMax = rangeMin + size, skip = 0, take = 0;
                let systemFiltersApis = systemApis.slice(rangeMin, rangeMax);
                if (systemFiltersApis.length == size) {
                    return {
                        total: total,
                        apis: systemFiltersApis.map(function (sa) {
                            return {
                                id: 0,
                                method: sa,
                                group: { groupid: 0 },
                                env: { envid: 0 },
                                handler: { type: "function", value: "" },
                                desc: global.SYSTEM_APIS[sa].desc,
                                must_session: global.SYSTEM_APIS[sa].must_session,
                                need_securty: global.SYSTEM_APIS[sa].need_securty
                            }
                        })
                    }
                }
                else if (systemFiltersApis.length > 0) {
                    take = size - systemFiltersApis.length;
                }
                else if (systemFiltersApis.length == 0) {
                    take = size;
                    skip = rangeMin - systemApis.length;
                }
                let apis = await query.skip(skip).take(take).array();
                let groups = [], envs = [];
                apis.forEach(function (a) {
                    let gid = a.groupid;
                    if (!groups.some(function (g) {
                        return g == gid
                    })) {
                        groups.push(gid);
                    }
                    let eid = a.envid;
                    if (!envs.some(function (e) {
                        return e == eid
                    })) {
                        envs.push(eid);
                    }
                });
                let groupMap = {}, envMap = {};
                if (groups.length) {
                    groups = await db.table("groups").select("id", "name").array();
                    groups.forEach(function (g) {
                        groupMap[g.id] = g.name;
                    });
                }
                if (envs.length) {
                    envs = await db.table("envs").select("id", "name", "url").array();
                    envs.forEach(function (e) {
                        envMap[e.id] = {
                            id: e.id,
                            name: e.name,
                            url: e.url
                        };
                    });
                }
                let db_apis = apis.map(function (a) {
                    return {
                        id: a.id,
                        method: a.method,
                        status: a.status,
                        group: {
                            id: a.groupid,
                            name: groupMap[a.groupid]
                        },
                        env: envMap[a.envid] || {
                            id: a.envid
                        },
                        handler: {
                            type: "url",
                            value: a.url
                        },
                        desc: a.desc,
                        must_session: !!a.must_session,
                        need_securty: !!a.need_securty
                    }
                });
                systemFiltersApis = systemFiltersApis.map(function (sa) {
                    return {
                        id: 0,
                        method: sa,
                        group: { groupid: 0 },
                        env: { envid: 0 },
                        handler: { type: "function", value: "" },
                        desc: global.SYSTEM_APIS[sa].desc,
                        must_session: global.SYSTEM_APIS[sa].must_session,
                        need_securty: global.SYSTEM_APIS[sa].need_securty

                    }
                })
                db_apis.forEach(function (da) {
                    systemFiltersApis.push(da);
                })
                return {
                    total: total,
                    apis: systemFiltersApis
                };
            }
        }
    },
    "apibus.api.add": {
        fields: [{
            name: "api",
            type: "string",
            desc: "接口名称",
            required: true
        }, {
            name: "status",
            type: "enum",
            required: true,
            list: "enable,disabled",
            desc: "状态：enable=可用，disabled=禁用"
        }, {
            name: "groupid",
            type: "number",
            required: true,
            min: 1,
            desc: "分组id"
        }, {
            name: "envid",
            type: "number",
            required: true,
            min: 1,
            desc: "部署环境id"
        }, {
            name: "must_session",
            type: "boolean",
            required: false,
            defaultValue: "false",
            desc: "是否需要用户授权才能调用"
        }, {
            name: "need_securty",
            type: "boolean",
            required: false,
            defaultValue: "false",
            desc: "接口是否需要安全码才能调用"
        }, {
            name: "url",
            type: "string",
            required: true,
            desc: "接口请求地址"
        }, {
            name: "desc",
            type: "string",
            required: false,
            desc: "接口描述"
        }],
        desc: "添加一个接口",
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim()
                    , status = form["status"]
                    , groupid = form["groupid"]
                    , must_session = (form["must_session"] == "true" || form["must_session"] === true) ? 1 : 0
                    , need_securty = (form["need_securty"] == "true" || form["need_securty"] === true) ? 1 : 0
                    , envid = form["envid"]
                    , url = form["url"]
                    , desc = form["desc"];
                if (global.SYSTEM_APIS[api]) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + api + "的接口。"
                        }
                    }
                }
                var exists = await db.table("apis").where({ method: api }).first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:api",
                            sub_msg: "已存在名称为" + api + "的接口。"
                        }
                    }
                }
                let group_info = await db.table("groups").where({ id: groupid }).select("id", "name").first();
                if (!group_info) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:groupid",
                            sub_msg: "分组不存在。"
                        }
                    }
                }
                let env_info = await db.table("envs").where({ id: envid }).select("id", "name").first();
                if (!env_info) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:envid",
                            sub_msg: "环境不存在。"
                        }
                    }
                }
                var this_time = moment().unix();
                var insert_data = {
                    method: api,
                    status: status,
                    groupid: group_info.id,
                    must_session: must_session,
                    envid: env_info.id,
                    url: url,
                    desc: desc,
                    insert_time: this_time,
                    last_update_time: this_time,
                    need_securty: need_securty
                }
                let res = await db.table("apis").insert(insert_data);
                return {
                    success: true,
                    id: res.insertId
                    , method: api
                    , status: status
                    , group: group_info,
                    env: env_info,
                    handler: {
                        type: "url",
                        value: url
                    },
                    desc: desc,
                    need_securty: need_securty
                };
            }
        }
    },
    "apibus.api.del": {
        fields: [{
            name: "api",
            type: "string",
            required: true,
            desc: "删除的接口名称"
        }],
        desc: "删除一个接口",
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim();
                let sync_res = await ApiSyncDel(api);
                if (sync_res.error_response) return sync_res;
                await redis.hdel("apis", api);
                let res = await db.table("apis").where({ method: api }).delete();
                return {
                    success: true,
                    deleteCount: res.affectedRows
                }
            }
        }
    },
    "apibus.api.update": {
        desc: "全量更新一个接口",
        fields: [{
            name: "apiid",
            type: "number",
            desc: "接口id",
            required: true,
            min: 1
        }, {
            name: "api",
            type: "string",
            desc: "接口名称",
            required: true
        }, {
            name: "status",
            type: "enum",
            required: true,
            list: "enable,disabled",
            desc: "状态：enable=可用，disabled=禁用"
        }, {
            name: "groupid",
            type: "number",
            required: true,
            min: 1,
            desc: "分组id"
        }, {
            name: "envid",
            type: "number",
            required: true,
            min: 1,
            desc: "部署环境id"
        }, {
            name: "must_session",
            type: "boolean",
            required: false,
            defaultValue: "false",
            desc: "是否需要用户授权才能调用"
        }, {
            name: "need_securty",
            type: "boolean",
            required: false,
            defaultValue: "false",
            desc: "接口是否需要安全码才能调用"
        }, {
            name: "url",
            type: "string",
            required: true,
            desc: "接口请求地址"
        }, {
            name: "desc",
            type: "string",
            required: false,
            desc: "接口描述"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let apiid = form["apiid"]
                    , api = form["api"].trim()
                    , status = form["status"]
                    , groupid = form["groupid"]
                    , must_session = (form["must_session"] == "true" || form["must_session"] === true) ? 1 : 0
                    , need_securty = (form["need_securty"] == "true" || form["need_securty"] === true) ? 1 : 0
                    , envid = form["envid"]
                    , url = form["url"]
                    , desc = form["desc"];
                var exists = await db.table("apis").where({ method: api }).where("id", apiid, "<>").first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + name + "的接口。"
                        }
                    }
                }
                let group_info = await db.table("groups").where({ id: groupid }).select("id", "name").first();
                if (!group_info) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:groupid",
                            sub_msg: "分组不存在。"
                        }
                    }
                }
                let env_info = await db.table("envs").where({ id: envid }).select("id", "name").first();
                if (!env_info) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:envid",
                            sub_msg: "环境不存在。"
                        }
                    }
                }
                var this_time = moment().unix();
                var update_data = {
                    method: api,
                    status: status,
                    groupid: group_info.id,
                    must_session: must_session,
                    envid: env_info.id,
                    url: url,
                    desc: desc,
                    last_update_time: this_time,
                    need_securty: need_securty
                }
                let res = await db.table("apis").where({ id: apiid }).update(update_data);
                return {
                    success: true,
                    id: Number(apiid)
                    , method: api
                    , status: status
                    , group: group_info,
                    env: env_info,
                    handler: {
                        type: "url",
                        value: url
                    },
                    desc: desc,
                    must_session: must_session,
                    need_securty: need_securty
                };
            }
        }
    },
    "apibus.api.sync": {
        desc: "同步一个接口到Redis和各部署环境",
        fields: [
            {
                name: "api",
                type: "string",
                required: true,
                desc: "需要同步的接口名称"
            }
        ],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim();
                let apiinfo = await db.table("apis").where({ method: api }).first();
                if (!apiinfo || apiinfo.status != "enable") {
                    let res = await ApiSyncDel(api);
                    if (res.error_response) {
                        return res;
                    }
                    await redis.hdel("apis", api);
                    return {
                        success: true
                    }
                }

                let fields = [];
                if (apiinfo.fields) {
                    try {
                        fields = JSON.parse(apiinfo.fields)
                    }
                    catch (e) {

                    }
                }
                let env = await db.table("envs").where({ id: apiinfo.envid }).first();
                if (!env) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:envid",
                            sub_msg: "接口运行环境不存在。"
                        }
                    }
                }
                let apiredis = {
                    fields: fields,
                    handler: {
                        type: "url",
                        value: apiinfo.url
                    },
                    env: {
                        name: env.name,
                        url: env.url
                    }
                }
                let res = await ApiSyncUpdate(api, apiredis);
                if (res.error_response) return res;
                await redis.hset("apis", api, JSON.stringify(apiredis))

                return {
                    success: true
                }
            }
        }
    },
    "apibus.api.status.update": {
        desc: "接口状态更新",
        fields: [{
            name: "api",
            type: "string",
            desc: "接口名称",
            required: true
        }, {
            name: "status",
            type: "enum",
            required: true,
            list: "enable,disabled",
            desc: "状态：enable=可用，disabled=禁用"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim()
                    , status = form["status"];
                var res = await db.table("apis").where({ method: api }).update({
                    status: status
                });
                return {
                    success: true,
                    updateCount: res.affectedRows
                }
            }
        }
    },
    "apibus.api.fields.get": {
        desc: "获取接口的入参信息",
        fields: [{
            name: "api",
            type: "string",
            desc: "接口名称",
            required: true
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim();
                if (global.SYSTEM_APIS[api]) {
                    return global.SYSTEM_APIS[api].fields;
                }
                let fields = await db.table("apis").where({ method: api }).select("fields").first();
                if (!fields) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:api",
                            sub_msg: "接口" + api + "不存在。"
                        }
                    }
                }
                fields = fields.fields;
                if (!fields) {
                    return []
                }
                try {
                    fields = JSON.parse(fields);
                }
                catch (e) {
                    logger.error("获取接口" + api + "参数错误", e);
                    fields = [];
                }
                if (!Array.isArray(fields)) {
                    logger.error("接口" + api + "参数格式错误", fields);
                    fields = [];
                }
                return fields;
            }
        }
    },
    "apibus.api.field.add": {
        desc: "为接口增加一个参数",
        fields: [{
            name: "api",
            type: "string",
            desc: "接口名称",
            required: true
        }, {
            name: "name",
            type: "string",
            desc: "参数名称",
            required: true
        }, {
            name: "type",
            type: "enum",
            desc: "参数类型",
            list: "string,enum,number,boolean,json,json-array,binary",
            required: true
        }, {
            name: "defaultValue",
            type: "string",
            desc: "参数默认值",
            required: false
        }, {
            name: "desc",
            type: "string",
            desc: "参数描述",
            required: false
        }, {
            name: "required",
            type: "boolean",
            desc: "参数是否必填",
            defaultValue: "false",
            required: false
        }, {
            name: "max",
            type: "number",
            desc: "参数的最大值。当参数类型为number时，此参数才生效。",
            required: false
        }, {
            name: "min",
            type: "number",
            desc: "参数的最小值。当参数类型为number时，此参数才生效。",
            required: false
        }, {
            name: "maxLength",
            type: "number",
            desc: "参数的最大长度，每个汉字占2个长度。当参数类型为string,json,json-array时，此参数才生效。",
            required: false
        }, {
            name: "list",
            type: "string",
            desc: "当类型为enmu时，该值有效。多个值用英文逗号分隔",
            required: false
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim();
                let name = form["name"].toLowerCase();
                let fields = await db.table("apis").where({ method: api }).select("fields").first();
                if (!fields) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:api",
                            sub_msg: "接口" + api + "不存在。"
                        }
                    }
                }
                fields = fields.fields;
                if (!fields) {
                    fields = [];
                }
                else {
                    try {
                        fields = JSON.parse(fields);
                    }
                    catch (e) {
                        logger.error("接口" + api + "参数错误", e);
                        fields = [];
                    }
                    if (!Array.isArray(fields)) {
                        logger.error("接口" + api + "参数格式错误", fields);
                        fields = [];
                    }
                }
                if (fields.some(function (f) {
                    return f.name == name
                })) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "参数" + name + "已存在。"
                        }
                    }
                }
                let field = {
                    name: name,
                    type: form["type"],
                    defaultValue: form["defaultValue"],
                    desc: form["desc"],
                    required: form["required"] === true || form["required"] === "true"
                };
                if (["string", "json", "json-array"].indexOf(form["type"]) > -1) {
                    if (!isNaN(form["maxLength"]) && form["maxLength"] !== "") {
                        field["maxLength"] = parseInt(form["maxLength"]);
                    }
                }
                else if (form["type"] === "number") {
                    if (!isNaN(form["max"]) && form["max"] !== "") {
                        field["max"] = Number(form["max"]);
                    }
                }
                else if (form["type"] === "enum") {
                    if (form["list"] !== "") {
                        field["list"] = form["list"];
                    }
                }
                fields.push(field);
                await db.table("apis").where({ method: api }).update({ fields: JSON.stringify(fields) });
                return field;
            }
        }
    },
    "apibus.api.field.del": {
        desc: "删除一个入参",
        fields: [{
            name: "api",
            type: "string",
            desc: "接口名称",
            required: true
        }, {
            name: "field",
            type: "string",
            desc: "需要删除的参数名称",
            required: true
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim();
                let field = form["field"].toLowerCase();
                let fields = await db.table("apis").where({ method: api }).select("fields").first();
                if (!fields) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:api",
                            sub_msg: "接口" + api + "不存在。"
                        }
                    }
                }
                fields = fields.fields;
                if (!fields) {
                    fields = [];
                }
                else {
                    try {
                        fields = JSON.parse(fields);
                    }
                    catch (e) {
                        logger.error("接口" + api + "参数错误", e);
                        fields = [];
                    }
                    if (!Array.isArray(fields)) {
                        logger.error("接口" + api + "参数格式错误", fields);
                        fields = [];
                    }
                }
                fields = fields.filter(function (f) {
                    return f.name !== field;
                });
                await db.table("apis").where({ method: api }).update({ fields: JSON.stringify(fields) });
                return {
                    success: true
                };
            }
        }
    },
    "apibus.api.field.update": {
        desc: "全量更新一个参数",
        fields: [{
            name: "field",
            type: "string",
            desc: "需要更新的参数名称",
            required: true
        }, {
            name: "api",
            type: "string",
            desc: "接口名称",
            required: true
        }, {
            name: "name",
            type: "string",
            desc: "参数名称",
            required: true
        }, {
            name: "type",
            type: "enum",
            desc: "参数类型",
            list: "string,enum,number,boolean,json,json-array,binary",
            required: true
        }, {
            name: "defaultValue",
            type: "string",
            desc: "参数默认值",
            required: false
        }, {
            name: "desc",
            type: "string",
            desc: "参数描述",
            required: false
        }, {
            name: "required",
            type: "boolean",
            desc: "参数是否必填",
            defaultValue: "false",
            required: false
        }, {
            name: "max",
            type: "number",
            desc: "参数的最大值。当参数类型为number时，此参数才生效。",
            required: false
        }, {
            name: "min",
            type: "number",
            desc: "参数的最小值。当参数类型为number时，此参数才生效。",
            required: false
        }, {
            name: "maxLength",
            type: "number",
            desc: "参数的最大长度，每个汉字占2个长度。当参数类型为string,json,json-array时，此参数才生效。",
            required: false
        }, {
            name: "list",
            type: "string",
            desc: "当类型为enmu时，该值有效。多个值用英文逗号分隔",
            required: false
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let api = form["api"].trim();
                let name = form["name"].toLowerCase();
                let fields = await db.table("apis").where({ method: api }).select("fields").first();
                if (!fields) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:api",
                            sub_msg: "接口" + api + "不存在。"
                        }
                    }
                }
                fields = fields.fields;
                if (!fields) {
                    fields = [];
                }
                else {
                    try {
                        fields = JSON.parse(fields);
                    }
                    catch (e) {
                        logger.error("接口" + api + "参数错误", e);
                        fields = [];
                    }
                    if (!Array.isArray(fields)) {
                        logger.error("接口" + api + "参数格式错误", fields);
                        fields = [];
                    }
                }
                let field = {
                    name: name,
                    type: form["type"],
                    defaultValue: form["defaultValue"],
                    desc: form["desc"],
                    required: form["required"] === true || form["required"] === "true"
                };
                if (["string", "json", "json-array"].indexOf(form["type"]) > -1) {
                    if (!isNaN(form["maxLength"]) && form["maxLength"] !== "") {
                        field["maxLength"] = parseInt(form["maxLength"]);
                    }
                }
                else if (form["type"] === "number") {
                    if (!isNaN(form["max"]) && form["max"] !== "") {
                        field["max"] = Number(form["max"]);
                    }
                    if (!isNaN(form["min"]) && form["min"] !== "") {
                        field["min"] = Number(form["min"]);
                    }
                }
                else if (form["type"] === "enum") {
                    if (form["list"] !== "") {
                        field["list"] = form["list"];
                    }
                }
                fields = fields.map(function (f) {
                    if (f.name == form["field"]) {
                        return field;
                    }
                    else {
                        return f;
                    }
                });
                let fieldCount = 0;
                fields.forEach(function (f) {
                    if (f.name == field) fieldCount++;
                });
                if (fieldCount > 1) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "参数" + name + "已存在。"
                        }
                    }
                }
                await db.table("apis").where({ method: api }).update({ fields: JSON.stringify(fields) });
                return field;
            }
        }
    },
    "apibus.groups.add": {
        desc: "添加一个分组",
        fields: [{
            name: "name",
            type: "string",
            required: true,
            desc: "分组名称"
        }, {
            name: "default_url",
            type: "string",
            required: true,
            desc: "分组默认处理器"
        }, {
            name: "doc_mode",
            type: "enum",
            required: true,
            list: "public,private",
            desc: "分组文档状态"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let name = form["name"].trim(), default_url = form["default_url"], desc = form["desc"], doc_mode = form["doc_mode"];
                var exists = await db.table("groups").where({ name: name }).first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + name + "的分组。"
                        }
                    }
                }
                var insert_data = {
                    name: name,
                    default_url: default_url,
                    desc: desc,
                    doc_mode: doc_mode,
                    last_update_time: moment().unix()
                }
                let res = await db.table("groups").insert(insert_data);
                return Object.assign({ success: true, id: res.insertId }, insert_data);
            }
        }
    },
    "apibus.groups.update": {
        desc: "全量更新一个分组信息",
        fields: [{
            name: "groupid",
            type: "number",
            required: true,
            desc: "分组id",
            min: 1
        }, {
            name: "name",
            type: "string",
            required: true,
            desc: "分组名称"
        }, {
            name: "default_url",
            type: "string",
            required: true,
            desc: "分组默认处理器"
        }, {
            name: "doc_mode",
            type: "enum",
            required: true,
            list: "public,private",
            desc: "分组文档状态"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let groupid = form["groupid"];
                let name = form["name"].trim(), default_url = form["default_url"], desc = form["desc"], doc_mode = form["doc_mode"];
                var exists = await db.table("groups").where({ name: name }).where("id", groupid, "<>").first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + name + "的分组。"
                        }
                    }
                }
                var res = await db.table("groups").where({ id: groupid }).update({
                    name: name,
                    default_url: default_url,
                    desc: desc,
                    doc_mode: doc_mode,
                    last_update_time: moment().unix()
                })
                return {
                    success: true,
                    name: name,
                    default_url: default_url,
                    desc: desc,
                    doc_mode: doc_mode,
                    id: groupid
                }
            }
        }
    },
    "apibus.groups.del": {
        desc: "删除一个分组",
        fields: [{
            name: "groupid",
            type: "number",
            required: true,
            desc: "分组id，当分组下有api时，不允许删除。",
            min: 1
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let groupid = form["groupid"];
                let count = await db.table("apis").where({ groupid: groupid }).count();
                if (count > 0) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:envid",
                            sub_msg: "当前分组下存在API。"
                        }
                    }
                }
                var res = await db.table("groups").where({ id: groupid }).delete();
                return {
                    success: true,
                    deleteCount: res.affectedRows
                }
            }
        }
    },
    "apibus.groups.get": {
        desc: "按页获取分组",
        fields: [{
            name: "page",
            type: "number",
            defaultValue: "1",
            required: false,
            min: 1,
            desc: "页码"
        },
        {
            name: "size",
            type: "number",
            defaultValue: "10",
            required: false,
            min: 1,
            max: 100,
            desc: "每页获取的数量"
        }, {
            name: "doc",
            type: "enum",
            required: false,
            list: "public,private",
            desc: "分组文档状态"
        }, {
            name: "keyword",
            type: "string",
            required: false,
            desc: "查询关键词"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let page = form["page"], size = form["size"], doc = form["doc"], keyword = form['keyword'];
                if (isNaN(page)) page = 1;
                if (page < 1) page = 1;
                if (isNaN(size)) size = 10;
                if (size < 1) size = 10;
                let query = db.table("groups");
                if (doc) {
                    query = query.where({ doc_mode: doc });
                }
                if (keyword) {
                    query = query.where("name", "%" + keyword + "%", 'like');
                }
                let total = await query.count();
                if (total <= (page - 1) * size) {
                    return {
                        total: total,
                        groups: []
                    }
                }
                let groups = await query.skip((page - 1) * size).take(size).array();
                return {
                    total: total,
                    groups: groups
                }
            }
        }
    },
    "apibus.groups.all.get": {
        desc: "获取所有分组信息",
        fields: [],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let groups = await db.table("groups").array();
                return groups.map(function (g) {
                    return {
                        name: g.name,
                        id: g.id,
                        default_url: g.default_url
                    }
                })
            }
        }
    },
    "apibus.envs.get": {
        desc: "按页获取部署环境",
        fields: [{
            name: "page",
            type: "number",
            defaultValue: "1",
            required: false,
            min: 1,
            desc: "页码"
        },
        {
            name: "size",
            type: "number",
            defaultValue: "10",
            required: false,
            min: 1,
            max: 100,
            desc: "每页获取的数量"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let page = form["page"], size = form["size"];
                if (isNaN(page)) page = 1;
                if (page < 1) page = 1;
                if (isNaN(size)) size = 10;
                if (size < 1) size = 10;
                let query = db.table("envs");
                let total = await query.count();
                if (total <= (page - 1) * size) {
                    return {
                        total: total,
                        envs: []
                    }
                }
                let envs = await query.skip((page - 1) * size).take(size).array();
                return {
                    total: total,
                    envs: envs.map(function (e) {
                        return {
                            id: e.id,
                            name: e.name,
                            desc: e.desc,
                            url: e.url
                        }
                    })
                }
            }
        }
    },
    "apibus.envs.add": {
        desc: "添加一个部署环境",
        fields: [{
            name: "name",
            type: "string",
            required: true,
            desc: "分组名称"
        }, {
            name: "url",
            type: "string",
            required: true,
            desc: "分组默认处理器"
        }, {
            name: "desc",
            type: "string",
            required: false,
            desc: "环境描述"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let name = form["name"].trim(), url = form["url"], desc = form["desc"];
                var exists = await db.table("envs").where({ name: name }).first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + name + "的环境。"
                        }
                    }
                }
                var insert_data = {
                    name: name,
                    url: url,
                    desc: desc,
                    last_update_time: moment().unix()
                }
                let res = await db.table("envs").insert(insert_data);
                return Object.assign({ success: true, id: res.insertId }, insert_data);
            }
        }
    },
    "apibus.envs.del": {
        desc: "删除一个部署环境",
        fields: [{
            name: "envid",
            type: "number",
            required: true,
            desc: "环境id，当环境下有api时，不允许删除。",
            min: 1
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let envid = form["envid"];
                let count = await db.table("apis").where({ envid: envid }).count();
                if (count > 0) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:envid",
                            sub_msg: "当前环境下存在API。"
                        }
                    }
                }
                var res = await db.table("envs").where({ id: envid }).delete();
                return {
                    success: true,
                    deleteCount: res.affectedRows
                }
            }
        }
    },
    "apibus.envs.update": {
        desc: "全量更新一个部署环境的信息",
        fields: [{
            name: "envid",
            type: "number",
            required: true,
            desc: "环境id。",
            min: 1
        }, {
            name: "name",
            type: "string",
            required: true,
            desc: "分组名称"
        }, {
            name: "url",
            type: "string",
            required: true,
            desc: "分组默认处理器"
        }, {
            name: "desc",
            type: "string",
            required: false,
            desc: "环境描述"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let envid = form["envid"];
                let name = form["name"].trim(), url = form["url"], desc = form["desc"];
                var exists = await db.table("envs").where({ name: name }).where("id", envid, "<>").first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + name + "的环境。"
                        }
                    }
                }
                var res = await db.table("envs").where({ id: envid }).update({
                    name: name,
                    url: url,
                    desc: desc,
                    last_update_time: moment().unix()
                })
                return {
                    success: true,
                    name: name,
                    url: url,
                    desc: desc,
                    id: envid
                }
            }
        }
    },
    "apibus.envs.all.get": {
        desc: "获取所有部署环境信息",
        fields: [],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let envs = await db.table("envs").array();
                return envs.map(function (e) {
                    return {
                        name: e.name,
                        id: e.id
                    }
                })
            }
        }
    },
    "apibus.apps.get": {
        desc: "按页获取应用列表",
        fields: [{
            name: "page",
            type: "number",
            defaultValue: "1",
            required: false,
            min: 1,
            desc: "页码"
        },
        {
            name: "size",
            type: "number",
            defaultValue: "10",
            required: false,
            min: 1,
            max: 100,
            desc: "每页获取的数量"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let page = form["page"], size = form["size"];
                if (isNaN(page)) page = 1;
                if (page < 1) page = 1;
                if (isNaN(size)) size = 10;
                if (size < 1) size = 10;
                let query = db.table("apps");
                let total = await query.count();
                if (total <= (page - 1) * size) {
                    return {
                        total: total,
                        apps: []
                    }
                }
                let apps = await query.skip((page - 1) * size).take(size).array();
                return {
                    total: total,
                    apps: apps
                }
            }
        }
    },
    "apibus.app.add": {
        desc: "添加一个应用",
        fields: [{
            name: "name",
            type: "string",
            required: true,
            desc: "应用名称"
        }, {
            name: "status",
            type: "enum",
            required: true,
            list: "enable,disabled",
            desc: "应用状态"
        }, {
            name: "flow",
            type: "number",
            required: true,
            min: 0,
            desc: "每日最大调用次数"
        }, {
            name: "level",
            type: "enum",
            required: true,
            list: "none,ipwhite",
            desc: "应用级别"
        }, {
            name: "summary",
            type: "string",
            required: false,
            desc: "应用说明"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let name = form["name"]
                    , status = form["status"]
                    , flow = parseInt(form["flow"] || 0)
                    , level = form["level"]
                    , summary = form["summary"];
                var exists = await db.table("apps").where({ name: name }).first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + name + "的应用。"
                        }
                    }
                }

                var insert_data = {
                    name: name,
                    status: status,
                    flow: flow,
                    level: level,
                    time: moment().unix(),
                    summary: summary,
                    secret: createSecret(),
                    securty_code: createSecret()
                }
                let res = await db.table("apps").insert(insert_data);
                return Object.assign({ success: true, appkey: res.insertId }, insert_data);
            }
        }
    },
    "apibus.app.status.update": {
        desc: "应用状态更新",
        fields: [{
            name: "app",
            type: "number",
            min: 1,
            desc: "应用appkey",
            required: true
        }, {
            name: "status",
            type: "enum",
            required: true,
            list: "enable,disabled",
            desc: "状态：enable=可用，disabled=禁用"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"]
                    , status = form["status"];
                var res = await db.table("apps").where({ appkey: app }).update({
                    status: status
                });
                return {
                    success: true,
                    updateCount: res.affectedRows
                }
            }
        }

    },
    "apibus.app.secret.update": {
        desc: "应用secret生成",
        fields: [{
            name: "app",
            type: "number",
            min: 1,
            desc: "应用appkey",
            required: true
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"];
                let secret = createSecret();
                var res = await db.table("apps").where({ appkey: app }).update({
                    secret: secret
                });
                return {
                    success: true,
                    updateCount: res.affectedRows,
                    value: secret
                }
            }
        }
    },
    "apibus.app.code.update": {
        desc: "生成新的应用安全码",
        fields: [{
            name: "app",
            type: "number",
            min: 1,
            desc: "应用appkey",
            required: true
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"];
                let secret = createSecret();
                var res = await db.table("apps").where({ appkey: app }).update({
                    securty_code: secret
                });
                return {
                    success: true,
                    updateCount: res.affectedRows,
                    securty_code: secret
                }
            }
        }
    },
    "apibus.app.del": {
        desc: "删除一个应用",
        fields: [{
            name: "app",
            type: "number",
            required: true,
            desc: "应用appkey",
            min: 1
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"];
                let sync_res = await AppSyncDel(app);
                if (sync_res.error_response) return sync_res;
                await redis.hdel("apps", app);
                var res = await db.table("apps").where({ appkey: app }).delete();
                return {
                    success: true,
                    deleteCount: res.affectedRows
                }
            }
        }
    },
    "apibus.app.update": {
        desc: "添加一个应用",
        fields: [{
            name: "app",
            type: "number",
            required: true,
            desc: "应用appkey",
            min: 1
        }, {
            name: "name",
            type: "string",
            required: true,
            desc: "应用名称"
        }, {
            name: "status",
            type: "enum",
            required: true,
            list: "enable,disabled",
            desc: "应用状态"
        }, {
            name: "flow",
            type: "number",
            required: true,
            min: 0,
            desc: "每日最大调用次数"
        }, {
            name: "level",
            type: "enum",
            required: true,
            list: "none,ipwhite",
            desc: "应用级别"
        }, {
            name: "summary",
            type: "string",
            required: false,
            desc: "应用说明"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"],
                    name = form["name"]
                    , status = form["status"]
                    , flow = parseInt(form["flow"] || 0)
                    , level = form["level"]
                    , summary = form["summary"];
                var exists = await db.table("apps").where({ name: name }).where("appkey", app, "<>").first();
                if (exists) {
                    return {
                        error_response: {
                            code: "41",
                            msg: "Invalid Arguments",
                            sub_code: "isv:invalid-arguments:name",
                            sub_msg: "已存在名称为" + name + "的应用。"
                        }
                    }
                }

                var update_data = {
                    name: name,
                    status: status,
                    flow: flow,
                    level: level,
                    time: moment().unix(),
                    summary: summary
                }
                let res = await db.table("apps").where({ appkey: app }).update(update_data);
                return Object.assign({ success: true, appkey: app }, update_data);
            }
        }
    },
    "apibus.app.power.update": {
        desc: "更新应用权限",
        fields: [{
            name: "app",
            type: "number",
            required: true,
            desc: "应用appkey",
            min: 1
        }, {
            name: "powers",
            type: "string",
            required: false,
            desc: "权限列表，多个用英文逗号分隔。若为*号表示全部接口权限",
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"],
                    powers = form["powers"];

                if (powers !== "*") {
                    powers = powers + "";
                    if (powers) {
                        powers = powers.split(",");
                        let systemApis = [];
                        powers = powers.map(function (p) {
                            if (global.SYSTEM_APIS[p]) {
                                systemApis.push(p);
                                return null;
                            }
                            return p;
                        });
                        powers = powers.filter(function (p) {
                            return p !== null;
                        });
                        if (powers.length) {
                            let apis = await db.table("apis").where({ method: powers }).select("method").array();
                            apis.forEach(function (a) {
                                systemApis.push(a.method);
                            });
                        }
                        powers = systemApis.join(",");
                    }
                }
                await db.table("apps").where({ appkey: app }).update({ apis: powers });
                return {
                    success: true,
                    apis: powers
                }
            }
        }
    },
    "apibus.app.ipwhite.update": {
        desc: "更新应用IP白名单列表",
        fields: [{
            name: "app",
            type: "number",
            required: true,
            desc: "应用appkey",
            min: 1
        }, {
            name: "ips",
            type: "string",
            required: false,
            desc: "IP地址列表，多个用英文逗号分隔",
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"],
                    ips = form["ips"];
                ips = (ips || "").split(",");
                ips = ips.map(function (i) {
                    return i.trim();
                });
                let ipList = [];
                for (let i = 0; i < ips.length; i++) {
                    if (/^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/ig.test(ips[i])) {
                        ipList.push(ips[i]);
                    }
                }
                ips = ipList.join(",");

                await db.table("apps").where({ appkey: app }).update({ ipwhite: ips });
                return {
                    success: true,
                    ipwhite: ips
                }
            }
        }
    },
    "apibus.app.sync": {
        desc: "在集群节点间同步一个app",
        fields: [{
            name: "app",
            type: "number",
            required: true,
            min: 1
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"];
                let appinfo = await db.table("apps").where({ appkey: app }).first();
                if (!appinfo || appinfo.status != "enable") {
                    let res = await AppSyncDel(app);
                    if (res.error_response) {
                        return res;
                    }
                    await redis.hdel("apps", app);
                    return {
                        success: true
                    }
                }
                let appredis = {
                    appkey: appinfo.appkey,
                    level: appinfo.level,
                    ipwhite: (appinfo.ipwhite || "").split(",").filter(function (a) { return !!a }),
                    flow: appinfo.flow || 0,
                    secret: appinfo.secret,
                    apis: appinfo.apis === "*" ? "*" : (appinfo.apis || "").split(",").filter(function (a) { return !!a }),
                    securty_code: appinfo.securty_code
                }
                let res = await AppSyncUpdate(app, appredis);
                if (res.error_response) return res;
                await redis.hset("apps", app, JSON.stringify(appredis))

                return {
                    success: true
                }
            }
        }
    },
    "apibus.session.create": {
        desc: "生成一个session信息",
        fields: [{
            name: "app",
            type: "string",
            required: true,
            desc: "session相对应的appkey"
        }, {
            name: "value",
            type: "string",
            required: true,
            desc: "session值，在调用其它接口时会将该值传给相应接口"
        }, {
            name: "expires_in",
            type: "number",
            required: true,
            min: 1,
            desc: "session过期时间，单位ms"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let app = form["app"]
                    , value = form["value"]
                    , expires_in = Number(form["expires_in"])
                    ;
                let sessionInfo = {
                    value: value,
                    expires_in: expires_in,
                    refresh_token: createSecret(64),
                    refresh_expires_time: moment().valueOf() + expires_in,
                    access_token: createSecret(64)
                }
                let sessionKey = "APIBUS:SESSION:" + app + ":" + sessionInfo.access_token;
                let sync_response = await SessionSyncUpdate(sessionKey, JSON.stringify(sessionInfo), expires_in);
                if (sync_response.error_response) return sync_response;
                await redis.set(sessionKey, JSON.stringify(sessionInfo), "PX", expires_in);
                return Object.assign({ expired: sessionInfo.refresh_expires_time }, sessionInfo);
            }
        }
    },
    "apibus.session.refresh": {
        desc: "刷新一个session的过期时间",
        fields: [{
            name: "session_key",
            type: "string",
            required: true,
            desc: "session值"
        }, {
            name: "refresh_token",
            type: "string",
            required: true,
            desc: "刷新session需要的token"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let session_key = form["session_key"]
                    , appkey = form["appkey"]
                    , refresh_token = form["refresh_token"]
                    ;
                let sessionKey = "APIBUS:SESSION:" + appkey + ":" + session_key;
                let value = await redis.get(sessionKey);
                if (!value) {
                    return {
                        error_response: {
                            code: 41, msg: 'Invalid Arguments',
                            sub_code: "isv.invalid-arguments:session_key",
                            sub_msg: "app下未找到当前session_key。"
                        }
                    }
                }
                try {
                    value = JSON.parse(value);
                }
                catch (e) {
                    await redis.del(sessionKey);
                    await SessionSyncDel(sessionKey);
                    return { error_response: { code: 27, msg: 'Invalid Session' } }
                }
                if (refresh_token != value.refresh_token) {
                    return {
                        error_response: {
                            code: 41, msg: 'Invalid Arguments',
                            sub_code: "isv.invalid-arguments:refresh_token",
                            sub_msg: "refresh_token与sessionkey不匹配。"
                        }
                    }
                }
                let pttl = await redis.pttl(sessionKey);
                pttl = pttl || 3600000;
                if (pttl > value.expires_in / 10 * 4) {
                    return Object.assign({ expired: value.refresh_expires_time }, value);
                }
                if (value.refresh_expires_time < moment().valueOf()) {
                    return {
                        error_response: {
                            code: 41, msg: 'Invalid Arguments',
                            sub_code: "isv.refresh_expires_time-expired",
                            sub_msg: "refresh_expires_time已过期"
                        }
                    }
                }

                let sessionInfo = value;
                sessionInfo.refresh_expires_time = moment().valueOf() + value.expires_in;
                let sync_response = await SessionSyncUpdate(sessionKey, JSON.stringify(sessionInfo), value.expires_in);
                if (sync_response.error_response) return sync_response;
                await redis.set(sessionKey, JSON.stringify(sessionInfo), "PX", value.expires_in);
                return Object.assign({ expired: sessionInfo.refresh_expires_time }, sessionInfo);
            }
        }
    },
    "apibus.session.del": {
        desc: "删除一个session",
        fields: [{
            name: "session_key",
            type: "string",
            required: true,
            desc: "session值"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let session_key = form["session_key"]
                    , appkey = form["appkey"];
                let sessionKey = "APIBUS:SESSION:" + appkey + ":" + session_key;
                logger.trace("remove redis key", sessionKey)
                await SessionSyncDel(sessionKey);
                await redis.del(sessionKey);
                return {
                    success: true
                }
            }
        }
    },
    "apibus.session.update": {
        desc: "更新一个session的值",
        need_securty: true,
        fields: [{
            name: "session_key",
            type: "string",
            required: true,
            desc: "用户当前的session"
        }, {
            name: "session_value",
            type: "json",
            required: true,
            desc: "需要设置的值，必须是JSON对象"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let session_key = form["session_key"]
                    , appkey = form["appkey"]
                    , session_value = form["session_value"]
                    ;
                let sessionKey = "APIBUS:SESSION:" + appkey + ":" + session_key;
                let value = await redis.get(sessionKey);
                if (!value) {
                    return {
                        error_response: {
                            code: 41, msg: 'Invalid Arguments',
                            sub_code: "isv.invalid-arguments:session_key",
                            sub_msg: "app下未找到当前session_key。"
                        }
                    }
                }
                try {
                    value = JSON.parse(value);
                }
                catch (e) {
                    await redis.del(sessionKey);
                    await SessionSyncDel(sessionKey);
                    return { error_response: { code: 27, msg: 'Invalid Session' } }
                }

                let sessionInfo = value;
                let pttl = await redis.pttl(sessionKey);
                if (!pttl) {
                    await redis.del(sessionKey);
                    await SessionSyncDel(sessionKey);
                    return { error_response: { code: 27, msg: 'Invalid Session' } }
                }
                sessionInfo.value = session_value;
                sessionInfo.expires_in = pttl;
                let sync_response = await SessionSyncUpdate(sessionKey, JSON.stringify(sessionInfo), pttl);
                if (sync_response.error_response) return sync_response;
                await redis.set(sessionKey, JSON.stringify(sessionInfo), "PX", pttl);
                return sessionInfo;
            }
        }
    },
    "apibus.session.get": {
        desc: "获取Session信息",
        need_securty: true,
        fields: [{
            name: "session_key",
            type: "string",
            required: true,
            desc: "用户当前的session"
        }],
        handler: {
            type: "function",
            value: async function (ctx, form) {
                let session_key = form["session_key"]
                    , appkey = form["appkey"]
                    ;
                let sessionKey = "APIBUS:SESSION:" + appkey + ":" + session_key;
                let value = await redis.get(sessionKey);
                if (!value) {
                    return {
                        error_response: {
                            code: 41, msg: 'Invalid Arguments',
                            sub_code: "isv.invalid-arguments:session_key",
                            sub_msg: "app下未找到当前session_key。"
                        }
                    }
                }
                try {
                    value = JSON.parse(value);
                }
                catch (e) {
                    await redis.del(sessionKey);
                    await SessionSyncDel(sessionKey);
                    return { error_response: { code: 27, msg: 'Invalid Session' } }
                }

                let sessionInfo = value;
                
                return sessionInfo;
            }
        }
    }
}