import Apibus from "../src/sdk";

let bus = new Apibus(0, "0", "https://apibus.tao11.la/",{
    parse:function(txt){
        alert(txt);
        return JSON.parse(txt);
    },
    stringify:function(obj){
        return JSON.stringify(obj);
    }
});
bus.Execute("taobao.shop.get",{nick:"ddd"}).then(function (res) {
    console.log(res);
});