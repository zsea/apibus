module.exports = {
    CORS: {
        domain: ["*"],
    },
    REDIS: {
        host: process.env["APIBUS_REDIS_HOST"] || "127.0.0.1",
        port: process.env["APIBUS_REDIS_PORT"] || 6379,
        password: process.env["APIBUS_REDIS_PASSWORD"] || undefined,
        db: process.env["APIBUS_REDIS_NUMBER"] || 0
    },
    MYSQL: {
        host: process.env["APIBUS_MYSQL_HOST"] || "127.0.0.1",
        port: process.env["APIBUS_MYSQL_PORT"] || 3306,
        user: process.env["APIBUS_MYSQL_USER"] || "root",
        password: process.env["APIBUS_MYSQL_PASSWORD"] || "",
        database: process.env["APIBUS_MYSQL_DBNAME"] || "apibus",
        connectionLimit: process.env["APIBUS_MYSQL_POOLSIZE"] || 8
    },
    BODY: {}//bodyParse转换配置，详见：bodyparser说明
    , ADMIN: {
        APPKEY: process.env["APIBUS_ADMIN_APPKEY"] || 0,
        SECRET: process.env["APIBUS_ADMIN_SECRET"] || 0
    },
    CLUSTER: {
        TOKEN: process.env["APIBUS_CLUSTER_TOKEN"],
        MANAGER: process.env["APIBUS_CLUSTER_MANAGER"] == "true",
        NODENAME: process.env["APIBUS_CLUSTER_NODENAME"] || "master"
    },
    REQUEST_LOG: {
        HANDLER: process.env["APIBUS_LOG_HANDLER"] || "none" //可选值:none/fetch/redis
        , URL: process.env["APIBUS_LOG_URL"] //当处理器为fetch时，该值必填
    }
    , RUN_LOG_LEVEL: process.env["APIBUS_RUN_LOG_LEVEL"] || "ERROR"
    , FORWARD_MAX_TIMES:process.env["FORWARD_MAX_TIMES"]||5 //调用接口失败时最大重试次数
}