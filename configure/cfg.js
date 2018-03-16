module.exports = {
    CORS: {
        domain: ["*"],
    },
    REDIS: {
        host: "127.0.0.1",
        port: 6379,
        //password:""
        db: process.env["APIBUS_REDIS_NUMBER"] || 0
    },
    MYSQL: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "",
        database: "apibus",
        connectionLimit: 8
    },
    BODY: {}//bodyParse转换配置，详见：koa-better-body说明
    , ADMIN: {
        APPKEY: 0,
        SECRET: 0
    },
    CLUSTER: {
        TOKEN: "1",
        MANAGER: process.env["APIBUS_MANAGER"]=="true",
        NODENAME: process.env["APIBUS_NODE_NAME"] || "master"
    }
}