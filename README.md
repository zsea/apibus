# APIBus

支持多云部署的API管理系统。APIBus是系统所有api的入口，完成所有api的参数校验、权限控制、隐藏内部接口地址。

# 安装

可直接使docker镜像进行安装

# 配置

## Kubernetes

在Kubernetes中可以使用configMap进行配置，也可以使用环境变量进行配置。

配置示例：

```javascript
module.exports = {
    CORS: {
        domain: ["*"],
    },
    REDIS: {
        host: "127.0.0.1",
        port: 6379,
        password:""
        db: 0
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
        MANAGER: true,
        NODENAME: "master"
    },
    REQUEST_LOG: {
        HANDLER: process.env["APIBUS_LOG_HANDLER"] || "none" //可选值:none/fetch/redis
        , URL: process.env["APIBUS_LOG_URL"] //当处理器为fetch时，该值必填
    }
    , RUN_LOG_LEVEL: process.env["APIBUS_RUN_LOG_LEVEL"] || "ERROR"
}
```

## 环境变量

|参数名   |默认值   |描述    |
|--------|--------|---|
|APIBUS_REDIS_HOST|127.0.0.1|Redis服务器主机地址|
|APIBUS_REDIS_PORT|6379|Redis服务器主机端口|
|APIBUS_REDIS_PASSWORD| |Redis服务器密码|
|APIBUS_REDIS_NUMBER|0|Redis数据库编号|
|APIBUS_MYSQL_HOST|127.0.0.1|Mysql服务器主机地址|
|APIBUS_MYSQL_PORT|3306|Mysql服务器主机端口|
|APIBUS_MYSQL_USER|root|Mysql数据库账号|
|APIBUS_MYSQL_PASSWORD| |Mysql数据库密码|
|APIBUS_MYSQL_DBNAME|apibus|Mysql数据库名称|
|APIBUS_MYSQL_POOLSIZE|8|Mysql数据库连接池大小|
|APIBUS_CLUSTER_TOKEN| |多云间通信token|
|APIBUS_CLUSTER_MANAGER| |当前节点是否管理节点，```true```为是。|
|APIBUS_CLUSTER_NODENAME|master|当前节点名称|
|APIBUS_ADMIN_APPKEY|0|用于管理的appkey|
|APIBUS_ADMIN_SECRET|0|用于管理的secret|
|APIBUS_LOG_HANDLER|none|请求的日志处理器，可选项：none/fetch/redis|
|APIBUS_LOG_URL| |若日志处理器为fetch，此参数指定接受日志的服务器URL|
|APIBUS_RUN_LOG_LEVEL|ERROR|运行日志级别，请参考log4js|
|FORWARD_MAX_TIMES|5|发生网络错误时，内部服务器请求的最大次数。|
|APIBUS_PORT|3000|APIBUS服务器侦听的网络端口。|

**注意**

1. 若当前节点为非管理节点，可不配置MYSQL相关信息。
2. 各节点的管理apkey和secret应当相同。
3. 各节点的通信token应当相同。

# 开发文档

总纲[dev.md](./dev.md)

数据库创建[sql.md](./sql.md)

## 请求日志

### 日志类别 

请求日志配置参数包括：none/fetch/redis

#### none

不记录日志

#### fetch

将日志转发到一个URL进行处理，

#### redis

将日志数据存储到apibus相同redis数据库的apibus:logs的list中。

### 日志格式

```json
{
  "request": {
    "version": 4,
    "appkey": "0",
    "time": 1521518106,
    "method": "apibus.time.get",
    "format": "json",
    "sign_method": "md5",
    "signature": "f01c24e6bb857e5c994d2d78fa687313"
  },
  "response": {
    "apibus_time_get_response": {
      "time": 1521518106913,
      "node": "master"
    },
    "request_id": "uocxvvqrjz7huhrh4snss3pmmwgmzr9n"
  },
  "request_id": "uocxvvqrjz7huhrh4snss3pmmwgmzr9n",
  "user_ip": "::ffff:127.0.0.1"
}
```
**注意**,fetch类别的日志在请求header中设置```"Content-Type": "application/json"```。