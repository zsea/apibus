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
    }
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

**注意**

1. 若当前节点为非管理节点，可不配置MYSQL相关信息。
2. 各节点的管理apkey和secret应当相同。
3. 各节点的通信token应当相同。

# 开发文档

总纲[dev.md](./dev.md)

数据库创建[sql.md](./sql.md)
