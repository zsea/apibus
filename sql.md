APIBus使用Mysql进行数据存储，当前使用的数据存储于Redis中。

# DDL

```sql
CREATE TABLE `apis` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `method` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL,
  `groupid` int(11) NOT NULL DEFAULT '0',
  `must_session` int(1) NOT NULL DEFAULT '0',
  `envid` int(11) NOT NULL DEFAULT '0',
  `url` varchar(255) DEFAULT NULL,
  `desc` varchar(5000) DEFAULT NULL,
  `fields` varchar(5000) DEFAULT NULL,
  `insert_time` int(32) NOT NULL DEFAULT '0',
  `last_update_time` int(32) NOT NULL DEFAULT '0',
  PRIMARY KEY (`method`),
  KEY `IX_id` (`id`) USING HASH
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

CREATE TABLE `apps` (
  `appkey` int(11) NOT NULL AUTO_INCREMENT,
  `secret` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL COMMENT '应用名称',
  `status` varchar(255) DEFAULT NULL COMMENT 'enable/disable',
  `flow` int(11) NOT NULL DEFAULT '0' COMMENT '每天的流量',
  `apis` longtext COMMENT '用户调用的api列表，用英文逗号分隔',
  `level` varchar(255) DEFAULT NULL COMMENT 'none=无限制，ipwhite=ip白名单，其它待定',
  `ipwhite` varchar(1000) DEFAULT NULL,
  `time` int(32) DEFAULT NULL,
  `summary` varchar(800) DEFAULT NULL,
  PRIMARY KEY (`appkey`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

CREATE TABLE `envs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `desc` varchar(800) DEFAULT NULL,
  `last_update_time` int(32) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `default_url` varchar(255) DEFAULT NULL COMMENT '默认处理器URL',
  `desc` varchar(500) DEFAULT NULL,
  `doc_mode` varchar(50) DEFAULT NULL COMMENT '文档状态，public/private',
  `last_update_time` int(32) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
```