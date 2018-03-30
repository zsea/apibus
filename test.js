var ApiBus = require('./index');

var bus = new ApiBus(0, 0, "http://127.0.0.1:3000");

(async function (params) {
    let response = await bus.Execute("apibus.time.get",{
        value:{a:"=b"}
    });
    console.log(JSON.stringify(response, null, 4));
})()