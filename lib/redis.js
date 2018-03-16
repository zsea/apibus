var cfg = require("../configure/cfg");
const moment = require("moment"), apis = require("./apis");
module.exports = {
    get_app: async function (appkey) {
        if (appkey == cfg.ADMIN.APPKEY) {
            return {
                flow: 0,
                secret: cfg.ADMIN.SECRET,
                apis: "*",
                level: "none"
            }
        }
        let appinfo = await redis.hget("apps", appkey);
        if (!appinfo) return null;
        return JSON.parse(appinfo);
    },
    add_flow: async function (appid, max) {
        var key = "flow_" + moment().format("YYYYMMDD");
        if (max > 0) {
            var used = await redis.send("hget", [key, appid]);
            if (used >= max) {
                return false;
            }
        }
        await redis.hincrby(key, appid, 1);
        return true;
    },
    get_method: async function (method) {
        if (apis[method]) {
            return apis[method];
        }
        let apiinfo = await redis.hget("apis", method);
        if (!apiinfo) return null;
        return JSON.parse(apiinfo);
    },
    get_user: async function () {

    }
}