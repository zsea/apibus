APIBus Javascript实现的SDK，用于浏览器

# 安装

```shell
npm install --save web-apibus
```

# 使用方法

```javascript
import ApiBus from "web-apibus"
var bus = new ApiBus(0, 0, "http://127.0.0.1:3000",jsoner);
let response = await bus.Execute("apibus.time.get");
```

# 参数

jsoner用于外接JSON处理器，可用于处理bigint，默认使用```window.JSON```。