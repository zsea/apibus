APIBus的Node端SDK实现

# 安装

```shell
npm install --save node-apibus
```

# 使用方法

```javascript
var ApiBus = require('node-apibus');
var bus = new ApiBus(0, 0, "http://127.0.0.1:3000");
let response = await bus.Execute("apibus.time.get");
```