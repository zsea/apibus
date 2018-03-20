APIBus Javascript实现的SDK，用于浏览器

# 安装

```shell
npm install --save web-apibus
```

# 使用方法

```javascript
import ApiBus from "web-apibus"
var bus = new ApiBus(0, 0, "http://127.0.0.1:3000");
let response = await bus.Execute("apibus.time.get");
```