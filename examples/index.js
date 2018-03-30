import Apibus from "../src/sdk";

let bus = new Apibus(0, 0, "http://127.0.0.1:3000");
bus.Execute("apibus.time.get").then(function (res) {
    console.log(res);
});